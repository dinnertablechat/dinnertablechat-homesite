import GameLift from 'aws-sdk/clients/gamelift';
import { isLive } from '../utils/AppMeta';
import * as shake from './HandShakeService';
import * as DebateModel from '../models/DebateModel';
import { refreshCredentials } from './AuthService';
import retry from 'async-retry';
type OnMatched = DebateModel.MatchModelType;

let gameLift: GameLift;

const stopFlags: { [ticket: string]: StopFlag } = {}; // ticketid: flag

const delayProp = async (obj: { flag: boolean }, prop: string) =>
  await retry(
    async bail => {
      if (obj[prop]) return true;
      else throw new Error('retry');
    },
    {
      retries: 8,
      factor: 1,
      maxTimeout: 1000,
      minTimeout: 1000
    }
  );
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function init(options: GameLift.ClientConfiguration) {
  console.log('gamelift init accessKeyId sessionToken', options.accessKeyId);
  if (!!gameLift) return;
  /* const options: AWS.GameLift.ClientConfiguration = { 
    region: 'us-east-1',
    accessKeyId,
    secretAccessKey,
    sessionToken
  }; */
  await refreshCredentials();
  gameLift = new GameLift(options);
}

interface StopFlag {
  flag: boolean;
}

function onMatchEvent(
  stopFlag: StopFlag,
  onMatchedCB: OnMatchedCB,
  err: any, // AWS.AWSError,
  data: GameLift.StartMatchmakingOutput
) {
  if (err) {
    console.log('onMatch', err);
    if (err.toString().indexOf('expired') !== -1) {
      onMatchedCB('expired_login');
    } else {
      onMatchedCB('qerror');
    }
    return;
  }
  console.log('onMatch output', data.MatchmakingTicket);
  console.log('onMatch Status', data.MatchmakingTicket!.Status);

  if (data.MatchmakingTicket!.Status === 'QUEUED') {
    console.log(
      'data.MatchmakingTicket!.TicketId!',
      data.MatchmakingTicket!.TicketId!
    );

    const pid: string = data.MatchmakingTicket!.Players![0].PlayerId!;
    console.log('pid', pid);
    poll(stopFlag, onMatchedCB, data.MatchmakingTicket!.TicketId!, pid);
  }
}

async function poll(
  stopFlag: StopFlag,
  onMatchedCB: OnMatchedCB,
  tid: string,
  playerId: string
) {
  if (stopFlag.flag) return; // end;

  // const info = await
  // gameLift.dec
  const RETRY_TIME = 5000;
  gameLift.describeMatchmaking({ TicketIds: [tid] }, async (e: any, d: any) => {
    if (e) return console.log('err', e);
    if (stopFlag.flag) return; // end;

    const ticket = d.TicketList[0];
    if (ticket.Players.length > 1) {
      console.log('!!!', ticket.Players);
      return;
    }
    if (ticket.Status === 'PLACING') {
      console.log('entering placing, stopping poll', ticket);
      // wait for dyanmo match to be saved
      await delay(RETRY_TIME / 2);
      let player = await shake.sync(playerId); // allow time for lambda to save
      /* if (!player) {
        await delay(RETRY_TIME / 2);
        player = await shake.sync(playerId);
      }*/
      if (!player) return onMatchedCB('matchtimeout');

      onMatchedCB({
        team: player.team as any,
        leader: player.leader,
        matchId: player.match,
        sync: false,
        userId: playerId,
        otherState: null,
        timeStarted: 0
      });
      return;
    }
    if (ticket.Status === 'TIMED_OUT') {
      console.log('timed out, stopping poll');
      onMatchedCB('matchtimeout');
      return; // not polling
    }
    if (ticket.Status === 'CANCELLED') {
      onMatchedCB('CANCELLED');
      console.log('CANCELLED, stopping poll');
      return; // not polling
    }
    console.log('ticketinfo', ticket.Status, ticket);
    setTimeout(poll, RETRY_TIME, stopFlag, onMatchedCB, tid, playerId);
  });
  // console.log('info', info)
  //
}

type ErrorString = string;
type OnMatchedCB = (model: OnMatched | ErrorString) => void;
export async function queueUp(
  topic: string,
  side: number,
  playerId: string,
  // guestSeed: string,
  donation: number,
  chararacter: number,
  onMatchedCB: OnMatchedCB
) {
  const env = isLive() ? 'prod' : 'dev';

  // add uuid to guest
  // if (playerId === '78439c31-beef-4f4d-afbb-e948e3d3c932')
  //  playerId += '__' + guestSeed; // ensure session uniqueness in dtc_sync pool

  console.log(
    'queueUp:',
    'env ' + env,
    'topic ' + topic,
    'side ' + side,
    'pid ' + playerId,
    'don ' + donation,
    'char ' + chararacter
    // 'team: ' + teamName
  );

  const sideStr = '' + side;
  const others = ['0', '1', '2'].filter(x => x !== sideStr);

  const options: GameLift.StartMatchmakingInput = {
    ConfigurationName: 'dtc-match-config',
    // TicketId: 'STRING_VALUE', allow autogeneration
    Players: [
      /* required */
      {
        /* LatencyInMs: {
          '<NonEmptyString>': 0
        },*/
        PlayerAttributes: {
          side: { S: sideStr },
          sideList: { SL: [sideStr] },
          preferredOpponents: { SL: others },
          donation: { N: donation },
          character: { N: chararacter },
          topic: { S: topic },
          env: { S: env }
        },
        PlayerId: playerId
      }
    ]
  };
  console.log('options', options);
  const stopFlag: StopFlag = { flag: false };
  const r = (await gameLift.startMatchmaking(
    options,
    onMatchEvent.bind(null, stopFlag, onMatchedCB)
  )) as any;
  // const r = .promise();
  if (!r || !r.response) throw new Error('no matchmake response');
  try {
    await delayProp(r.response, 'data');
  } catch (e) {
    console.warn('delayProp could resolve');
  }
  const TicketId = r.response.data.MatchmakingTicket.TicketId;
  console.log('r.MatchmakingTicket!.TicketId', TicketId);
  stopFlags[TicketId] = stopFlag;
  return TicketId;
}

export async function stopMatchmaking(TicketId: string) {
  console.log('stopMatchmaking');
  // stop our queue
  if (stopFlags[TicketId]) {
    console.log('queue stopFlag set to true');
    stopFlags[TicketId].flag = true;
  }
  try {
    const r = await gameLift.stopMatchmaking({ TicketId }).promise();
    console.log('stoppedMatchmaking TicketId', TicketId, r);
  } catch (e) {
    // console.log(e);
  }
  return true;
}

// todo remove later
export async function stopMatchmakingSimple(TicketId: string) {
  console.log('stopMatchmakingSimple');
  // stop our queue
  if (stopFlags[TicketId]) {
    console.log('queue stopFlag set');
    stopFlags[TicketId].flag = true;
  }
  gameLift.stopMatchmaking({ TicketId }, e => {
    console.log('STOPPED');
  });
  console.log('stoppedMatchmakingSimple TicketId', TicketId);
  return true;
}

/*
          '<NonZeroAndMaxString>': {
            N: 0.0,
            S: 'STRING_VALUE',
            SDM: {
              '<NonZeroAndMaxString>': 0.0,
            },
            SL: [
              'STRING_VALUE',
            ]
          },
*/
