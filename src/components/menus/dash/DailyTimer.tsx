import React from 'react';
import Countdown from 'react-countdown-now';
import { Typography } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles';

import * as AppModel from '../../../models/AppModel';
import * as Times from '../../../services/TimeService';
import { makeStyles } from'@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
      textAlign: 'center',
      paddingTop: theme.spacing(20)
    },
    timerText: {
      padding: '0',
      margin: 0,
      color: theme.palette.secondary.dark,
    },
    time: {
        color: theme.palette.secondary.dark,
        fontFamily: '\'Roboto Mono\', \'Courier New\'',
    }
  }));

function onMenuClick(store: AppModel.Type) {
  // store.debate.resetQueue();
  // store.gotoHomeMenu();
}

// Random component
const Completionist = ({ store }: { store: AppModel.Type }) => (
  <div style={{ textAlign: 'center' }}>
    <Typography variant="h1" align="center">
    </Typography>
  </div>
);

// Renderer callback with condition
const renderer = (
  classes,
  store: AppModel.Type,
  isDuringDebate: boolean,
  { days, hours, minutes, seconds, completed }
) => {
  isDuringDebate = Times.isDuringDebate(store.isLive);
  if (completed) {

      
      if(store.dailyOpen!==isDuringDebate) {
        // setTimeout(() => {
          console.log('BannerTimer completed');
          store.setDailyOpen(isDuringDebate);
          window.location.reload(true);
        // }, 3001);
      }
    // Render a completed state
    return <Completionist store={store} />;
  } else {

    const label = isDuringDebate ? 'Daily event ending in' : 'Daily event starts in';
    return (
      <div style={{ padding: 0, margin: 0 }}>
        <Typography variant="h6" align="center" className={classes.timerText} style={{fontSize: '1em'}}>
          {label}:
        </Typography>
        
        <Typography variant="h4" align="center" className={classes.time} style={{fontSize: '2em' }}>
        {hours < 10 ? '0' + hours : hours}&nbsp;{minutes < 10 ? '0' + minutes : minutes}&nbsp;{seconds < 10 ? '0' + seconds : seconds}
        </Typography>

        <Typography variant="h6" align="center" className={classes.timerText} style={{fontSize: '.6em' }}>
          HRS&nbsp;
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; MINS
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SECS
        </Typography>

        <a 
        style={{ textDecoration: 'underline' }}
        onClick={window.trackOutboundLinkClick(
                'https://www.facebook.com/events/522239821514316/'
              )} href="https://www.facebook.com/events/522239821514316/">Add to Facebook Calendar</a>
        
      </div>
    );
  }
};

interface Props {
  onCompleted?: () => void;
  store:any;
}

function DailyEndTimer(props:Props) {
  const classes = useStyles({});
  const { onCompleted } = props;
  const store = props.store;

  const isDuringDebate = Times.isDuringDebate(store.isLive);
  const endTime = isDuringDebate ? Times.getDebateEnd().getTime() : Times.getDebateStart().getTime();

  return (
    <Countdown
      onComplete={()=> onCompleted && onCompleted() }
      date={endTime}
      renderer={renderer.bind(null, classes, store, isDuringDebate)}
    />
  );
}

export default DailyEndTimer;
