/* tslint:disable:no-bitwise */
import awsmobile from '../aws-exports.js';
import 'aws-sdk/lib/node_loader'; // first time only

// import Core from 'aws-sdk/lib/core';
import AWS from 'aws-sdk/global';

import Auth from '@aws-amplify/auth';
import * as API from './APIService'; // TODO refactor

// import retry from 'async-retry';
import { Hub } from '@aws-amplify/core';
import { injectConfig } from '../configs/AWSconfig';

// Fix analytics error message
// import { CognitoUserSession } from 'amazon-cognito-identity-js';

// Analytics.configure({ disabled: true });

// (window as any).LOG_LEVEL = 'DEBUG';
// import { ConsoleLogger } from '@aws-amplify/core';

/*
const delayFlag = async (obj: { flag: boolean }) =>
  await retry(
    async bail => {
      if (obj.flag) return true;
      else throw new Error('retry');
    },
    {
      retries: 10,
      factor: 1,
      maxTimeout: 2000,
      minTimeout: 2000
    }
  );
*/

/* Debug only 
import {Logger} from '@aws-amplify/core';
Logger.LOG_LEVEL = 'DEBUG'; // Amplify.
(window as any).LOG_LEVEL = 'DEBUG';
*/

// https://github.com/aws-amplify/amplify-js/issues/1487

const awsconfig = injectConfig(awsmobile);

if (!AWS.config || !AWS.config.region) {
  AWS.config = new AWS.Config({ region: 'us-east-1' });
}

// configure(awsconfig); // just in case

/*
function getLoggger() {
  const logger: any = new ConsoleLogger('dtc_aws_log');
  logger.onHubCapsule = capsule => {
    switch (capsule.payload.event) {
      case 'signIn':
        logger.warn('user signed in'); // [ERROR] Alexander_the_auth_watcher - user signed in
        break;
      case 'signUp':
        logger.warn('user signed up');
        break;
      case 'signOut':
        logger.warn('user signed out');
        break;
      case 'signIn_failure':
        logger.warn('user sign in failed');
        break;
      case 'configured':
        // logger.warn('the Auth module is configured');
        break;
      default:
        break;
    }
  };
  return logger;
}
*/

export const LOGIN_EVENT = 'signIn';
export const LOGOUT_EVENT = 'signOut';

function onHubCapsule(cb: AwsCB, callbackPage: boolean = false, capsule: any) {
  // console.log('onHubCapsule', capsule);
  // getLoggger().onHubCapsule(capsule);

  const { channel, payload } = capsule; // source
  if (channel !== 'auth') return;

  /// console.log('payload.event', channel, payload.event);
  if (payload.event === LOGOUT_EVENT) {
    console.log('auth: cog logout event');
    // clearCache();
    /// checkUser(cb);
    // return;
  } else if (payload.event === LOGIN_EVENT) {
    console.log('auth: cog login event');
    //  || payload.event === 'cognitoHostedUI'
    // console.log('onHubCapsule signIn', capsule);
    checkUser(cb, LOGIN_EVENT);
  } else if (payload.event === 'configured' && !callbackPage) checkUser(cb);
  else console.log('event', payload.event, JSON.stringify(payload));
}

export async function configure(awsconfig) {
  if (!awsconfig) throw new Error('AuthService cannot load config.');
  Auth.configure(awsconfig);
  // return new Promise(r => setTimeout(r, 1));
}

export async function auth(cb: AwsCB, callbackPage: boolean = false) {
  console.log('auth: 0 start', callbackPage);

  // Order is important
  Hub.listen(/.*/, x => {
    // console.log('hubevent:', x);
  });
  Hub.listen(
    'auth',
    x => {
      onHubCapsule.bind(null, cb, callbackPage)(x);
    }
    // { onHubCapsule: onHubCapsule.bind(null, cb, callbackPage) }
    // ,'AuthService'
  );
  await configure(awsconfig);
  // ------------------ order important

  // ensure config is loaded
  // await (new Promise(r => setTimeout(r, 1)));
  // checkUser(cb); // required by amplify, for existing login

  // Configure APIService
  // console.log('awsmobileInjected', awsmobileInjected);
  try {
    const credentials = await refreshCredentials();
    API.configure({ ...awsconfig, Auth: credentials, credentials });
    console.log('auth: refreshCredentials finish');
  } catch (e) {
    console.log('aud: cannot figure API', e);
  }
}

type AwsCB = (auth: AwsAuth | null) => void;

export interface AwsAuth {
  // event: string;
  // user: any;
  name: string;
  email: string;
  groups: string[];
  id: string;
  event: string;
  // username: string;
  // region: string;
  // AccessKeyId: string;
  // SecretAccessKey: string;
  // SessionToken: string;
  userPoolId?: string;
}

const REGION = 'us-east-1';

// reuse last call
type Creds = { expired: boolean; refreshed: boolean } | any;
let credRefresh: Promise<any> | null;
let lastCred: Creds;

export async function refreshCredentials(): Promise<Creds> {
  if (lastCred && lastCred.expired === false) {
    return Promise.resolve(lastCred).then((x: Creds) => {
      x.refreshed = false;
      return x;
    });
  }
  // if(credRefresh) return credRefresh;
  // else credRefresh = new Promise()
  // ICredentials |
  // if (cacheCred) return cacheCred;
  // wait while another call is configuring
  /*
  if (cacheCred && !cacheCred.flag) {
    await delayFlag(cacheCred);
    return cacheCred;
  }
  */
  // cacheCred = { flag: false };

  if (credRefresh) return credRefresh;

  return (credRefresh = Auth.currentUserCredentials().then(
    currentCredentials => {
      // const currentCredentials = await credRefresh;
      credRefresh = null;
      // console.log('currentCredentials', currentCredentials);
      // const currentCredentials2 = await Auth.currentCredentials();
      // console.log('currentCredentials2', currentCredentials2);

      const cr = currentCredentials as any;
      if (!cr) throw new Error('not logged in');
      cr.region = REGION;
      /* const credentials = (cacheCred = Auth.essentialCredentials(
    currentCredentials
  )); */

      // console.log(cr);
      const params = cr.webIdentityCredentials
        ? cr.webIdentityCredentials.params
        : null;

      if (!params) {
        // console.log('cr', cr);
        throw new Error('no cred: ' + cr);
      }

      if (!cr._identityId && params && params.IdentityId)
        cr._identityId = params.IdentityId;

      if (!cr.identityId && params && params.IdentityId)
        cr.identityId = params.IdentityId;

      // console.log('currentCredentials', params);

      if (cr.webIdentityCredentials) {
        AWS.config.credentials = cr; //new AWS.CognitoIdentityCredentials(params);
      }
      /* AWS.config.update({
    credentials: new AWS.Credentials(credentials)
  });*/
      // console.log('refreshCredentials', credentials);

      lastCred = currentCredentials as Creds;

      lastCred.refreshed = true;
      if (lastCred.expired === undefined)
        throw new Error(
          'no expired prop on cred: ' + JSON.stringify(currentCredentials)
        );
      return currentCredentials;
    }
  ));
}

// const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function checkUser(cb: AwsCB, event: string = '') {
  // console.log('checkUser');
  // let data: any;
  let session: any | null = null; // CognitoUserSession
  let cr: any = null;
  // cacheCred = null; // clear apic cache, TODO: rework? check is token is still valid cache
  try {
    cr = await refreshCredentials(); //Auth.currentUserCredentials();
  } catch (e) {
    console.log('-currentUserCredentials', e);
    logout();
  }

  try {
    session = await Auth.currentSession();
  } catch (e) {
    console.log('-currentSession', e);
  }

  // const idenity = cr.identityId;
  // console.log('rrrr', cr, idenity);

  // console.log('session', session);

  let email: string = '';
  let name: string = '';
  let groups: string[] = [];
  let id: string = '';
  let debugSource = 'session';
  let debugObj: any = null;
  let userPoolId: any = null; // versus identity

  if (session) {
    // console.log('session', session);

    email = session.getIdToken().payload['email'];
    name = session.getIdToken().payload['name'];
    groups = session.getIdToken().payload['cognito:groups'];

    id = cr.identityId;
    userPoolId = session.getIdToken().payload['sub'];
  } else if (cr) {
    // console.log('unauth user', cr);
    // const newCred = await refreshCredentials(); // needed for dynamo labs
    // console.log('newCred', newCred);
    id = cr.identityId; // newCred.identityId;
    name = 'Guest';
    email = 'guest@dinnertable.chat';
    debugSource = 'cr.identityId';
    debugObj = cr.identityId;
  } else {
    cb(null);
    return;
  }

  // const email = session.getIdToken().payload['email'] || '';
  // const sub = session.getIdToken().payload['sub']; // || uuidv4();
  // const name = session.getIdToken().payload['name'] || 'Guest';
  // const groups = session.getIdToken().payload['cognito:groups'];

  if (!id) {
    console.warn('checkuser: no id');
    return;
    // throw new Error('checkuser: no id');
  }

  const authParams: any = {
    region: 'us-east-1',
    event: event || ''
  };

  const user: AwsAuth = {
    name,
    email,
    id, // data.username,
    groups,
    ...authParams
  };
  if (userPoolId) user.userPoolId = userPoolId;

  // const user = data.attributes;

  // console.log('user', user);

  //// AWS.config.credentials = new AWS.Credentials(credentials);
  // FIX: https://github.com/aws-amplify/amplify-js/issues/581
  AWS.config.update({
    dynamoDbCrc32: false
  });

  if (!user.name || !user.email) {
    //  || !authParams.accessKeyId
    console.log('aws: no valid returned-');
    cb(null);
    return;
  }

  cb(user);
}

// type EssentialCredentials = ReturnType<typeof Auth.essentialCredentials>;

export async function logout() {
  let currentUser;
  try {
    currentUser = await Auth.currentUserPoolUser();
  } catch (e) {}
  return Auth.signOut({ global: false })
    .finally(() => {
      // Amplify cleanup
      // console.log('Amplify Signout cleanup');
      (AWS.config?.credentials as any)?.clearCachedId();
      window.sessionStorage.removeItem('oauth_state'); // possible patch Invalid state in OAuth flow #3055

      Object.entries(localStorage)
        .map(x => x[0])
        .filter(x => x.indexOf('CognitoIdentityId') > -1)
        .map(x => localStorage.removeItem(x));

      // remove auth tokens
      lastCred = null;
      credRefresh = null;
    })
    .then(x => {
      console.log(
        'Signout',
        lastCred === null,
        currentUser && currentUser.signOut
      );

      // Force log out
      if (currentUser) {
        currentUser.signOut();
      }

      // console.log('logout', x);
      return x;
    })
    .catch((err: any) => {
      console.log('Error logging out: ' + err);
      return null;
    });
}

/* export async function clearCache() {
  await logout();
  // (AWS.config?.credentials as any)?.clearCachedId();
} */

/*
if (err.code === 'UserNotConfirmedException') {
      // The error happens if the user didn't finish the confirmation step when signing up
      // In this case you need to resend the code and confirm the user
      // About how to resend the code and confirm the user, please check the signUp part
    } else if (err.code === 'PasswordResetRequiredException') {
      // The error happens when the password is reset in the Cognito console
      // In this case you need to call forgotPassword to reset the password
      // Please check the Forgot Password part.
    } else {
    }
*/
