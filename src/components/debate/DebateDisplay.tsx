import * as React from 'react';
import {
  withStyles,
  createStyles,
  WithStyles,
  Theme
} from '@material-ui/core/styles';
import withRoot from '../../withRoot';

import Lottie from 'react-lottie';
import { observer } from 'mobx-react';
import { Typography, Divider } from '@material-ui/core';

import hark, { SpeechEvent } from 'hark';
import Peer from 'simple-peer';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      textAlign: 'center',
      paddingTop: theme.spacing.unit * 20
    },
    centered: {
      marginTop: '60px',
      paddingTop: '0',
      paddingLeft: '1em',
      paddingRight: '1em',
      marginLeft: 'auto',
      marginRight: 'auto',
      width: 'auto',
      maxWidth: '1000px',
      minWidth: '300px'
    },
    leftPos: {
      position:'absolute',
      left: 0,
      width:300,
      // transform: 'scale(1, 1)'
    },
    rightPos: {
      position:'absolute',
      right:0,
      transform: 'scale(-.5, .5)'
    }
  });

const aliceListenOptions = {
  loop: true,
  autoplay: true,
  path: 'assets/00_ALCE_LISTEN.json',
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

const aliceTalkOptions = {
  loop: true,
  autoplay: true,
  path: 'assets/00_ALCE_TALK.json',
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

const rabitListenOptions = {
  loop: true,
  autoplay: true,
  path: 'assets/01_RABIT_LISTEN.json',
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

const rabitTalkOptions = {
  loop: true,
  autoplay: true,
  path: 'assets/01_RABIT_TALK.json',
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

// import * as AppModel from '../../models/AppModel';
interface Props extends WithStyles<typeof styles> {
  // store: AppModel.Type;
  talkingBlue: boolean;
  // talkingBlueBlend: number;
  talkingRed: boolean;
}

// interface State {}

class DebateScene extends React.Component<Props, any> {
  public static getDerivedStateFromProps(nextProps:Props, prevState:Props) {
    if(nextProps.talkingBlue !== prevState.talkingBlue ) {
      return {};
    }
    return {};
  }

  public speechEvents: SpeechEvent;
  private vidRef = React.createRef<HTMLVideoElement>();

  constructor(props: Props) {
    super(props);
    this.state = { open: false };
  }

  public componentDidMount() {}

  public render() {
    const { classes, talkingBlue, talkingRed } = this.props;
    // if(this.state.talkingBlueBlend > 0 )

    console.log('talkingBlue', talkingBlue);
    // const { } = this.state;
    return (
      <React.Fragment>
        <div className={classes.centered}>
          <div style={{margin:'0 auto 0 auto', width: '100%'}}>
            <div className={classes.leftPos}>
              <div hidden={talkingBlue}>
                <Lottie
                  speed={1}
                  options={aliceListenOptions}
                  isClickToPauseDisabled={true}
                />
              </div>
              <div hidden={!talkingBlue}>
                <Lottie
                  speed={1}
                  options={aliceTalkOptions}
                  isClickToPauseDisabled={true}
                />
              </div>
            </div>
            <div className="flip {classes.rightPos}">
              <div hidden={talkingRed}>
                <Lottie
                  speed={1}
                  options={rabitListenOptions}
                  isClickToPauseDisabled={true}
                />
              </div>
              <div hidden={!talkingRed}>
                <Lottie
                  speed={1}
                  options={rabitTalkOptions}
                  isClickToPauseDisabled={true}
                />
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  private handleClose = () => {
    this.setState({
      open: false
    });
  };

  private handleClick = () => {
    this.setState({
      open: true
    });
  };
}

export default withRoot(withStyles(styles)(DebateScene));
