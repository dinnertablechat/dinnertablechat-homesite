import React, { useState, useContext } from 'react';
import { createStyles, WithStyles, Theme } from '@material-ui/core/styles';
import { Button, Typography, Paper, Grid, Card } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';
import MobileStepper from '@material-ui/core/MobileStepper';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

import * as AppModel from '../../models/AppModel';
import { inject } from 'mobx-react';
import HOC from '../HOC';
import { useTranslation } from 'react-i18next';
import { useTheme, makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  pagebody: {
    position: 'fixed',
    // backgroundColor: theme.palette.primary.light,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  grid: {
    height: 'calc(100vh - 155px)',
    maxHeight: '680px'
  },
  container: {
    marginTop: 52,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100vw',
    maxWidth: '1024px',
    minWidth: '300px',
    height: 'calc(100vh)',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    WebkitTransform: 'translateX(-50%)',
    transform: 'translateX(-50%)',
    [theme.breakpoints.down('xs')]: {
      // marginTop: 35
    }
  },
  header: {
    alignItems: 'center',
    height: 50
  },
  img: {
    // height: '35vh', // 40
    maxWidth: '30vw',
    // width: 250,
    overflow: 'hidden',
    borderRadius: 40,

    [theme.breakpoints.down('xs')]: {
      maxWidth: '100%',
      maxHeight: 'calc(43vh)'
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: '260px'
    }
    // display: 'block',
  },
  button: {
    marginTop: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  title: {
    color: theme.palette.secondary.main,
    fontSize: '1.8em',
    [theme.breakpoints.up('md')]: {
      fontSize: '3.0em'
    }
  },
  bodyText: {
    fontSize: '1.25em',
    color: '#5a5a5a',
    fontWeight: 500,
    padding: '0 8px 0 8px'
  }
}));

interface Props {
  // store: AppModel.Type;
  isTest?: boolean;
}
interface State {
  open: boolean;
  activeStep: number;
}

const tutorialSteps = [
  {
    title: 'Select Topic',
    subTitle:
      'Get started by selecting your topic position. Topics are selected via news trends and your vote in DTC polls.',
    imgPath: './imgs/02-topics.png'
  },
  {
    title: 'Choose Your Character',
    subTitle:
      'You control a virtual character that will talk as you do and listen to your matched partner.',
    imgPath: './imgs/04-select.png'
  },
  {
    title: 'Join Debate',
    subTitle:
      'Get matched with the other side. Be passionate about your views, keep an open mind and remember the golden rule.',
    imgPath: './imgs/press/01-scene1.png'
  },
  {
    title: 'Find Agreement',
    subTitle:
      'It is easy to disagree. Celebrate when you and your partner come to an agreement - big or small!',
    imgPath: './logos/dtclogo2.png'
  },
  {
    title: 'Give Feedback',
    subTitle:
      'Was your partner respectful, knowledgeable or crude? Let them know what you thought!',
    imgPath: './imgs/07-newsletter.png'
  },
  {
    title: 'Earn Achievements',
    subTitle:
      'Unlock badges as you cultivate positive discussions and find common ground!',
    imgPath: './imgs/04-select2.png'
  }
];

export default function GettingStarted(props: Props) {
  const [state, setState] = useState({ open: false, activeStep: 0 });
  const store = useContext(AppModel.Context)!;
  const classes = useStyles({});
  const { t } = useTranslation();

  const handleNext = () => {
    setState({ ...state, activeStep: state.activeStep + 1 });
  };

  const handleBack = () => {
    setState({ ...state, activeStep: state.activeStep - 1 });
  };

  const routeToPlay = () => {
    window.gtag('event', 'completed_tutorial', {
      event_category: 'splash',
      guest: store.isGuest()
    });

    if (
      store.isStandalone() &&
      store.auth.isNotLoggedIn &&
      !store.auth.isAuthenticated()
    )
      store.auth.login();
    else {
      if (localStorage.getItem('quickmatch')) store.router.push('/quickmatch');
      else store.gotoHomeMenu();
    }
  };

  const handleStepChange = activeStep => {
    setState({ ...state, activeStep });
  };

  const { activeStep } = state;
  const maxSteps = tutorialSteps.length;

  // TODO: better patch
  if (store.isStandalone() && store.auth.isAuthenticated())
    store.router.push('/home');

  return (
    <div className={classes.pagebody}>
      <div className={classes.container}>
        <SwipeableViews
          index={activeStep}
          onChangeIndex={handleStepChange}
          enableMouseEvents
        >
          {tutorialSteps.map((step, index) => (
            <div key={step.title}>
              <Grid
                container
                spacing={0}
                direction="row"
                alignItems="center"
                justify="center"
                className={classes.grid}
              >
                <Grid item xs={12}>
                  <Typography
                    variant="h1"
                    color="primary"
                    align="center"
                    className={classes.title}
                  >
                    {step.title}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={4}
                  style={{ textAlign: 'center', width: '100%' }}
                >
                  <img
                    className={classes.img}
                    src={step.imgPath}
                    alt={step.title}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="body2"
                    align="center"
                    className={classes.bodyText}
                  >
                    {step.subTitle}
                  </Typography>
                </Grid>
              </Grid>
            </div>
          ))}
        </SwipeableViews>

        {activeStep !== maxSteps - 1 ? null : (
          <div style={{ textAlign: 'center' }}>
            <Button variant="contained" color="secondary" onClick={routeToPlay}>
              Let's Begin
            </Button>
          </div>
        )}
        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          color="secondary"
          nextButton={
            <Button
              size="small"
              onClick={handleNext}
              disabled={state.activeStep === 5}
            >
              Next
              <KeyboardArrowRight />
            </Button>
          }
          backButton={
            <Button
              size="small"
              onClick={handleBack}
              disabled={state.activeStep === 0}
            >
              <KeyboardArrowLeft />
              Back
            </Button>
          }
        />
      </div>
    </div>
  );
}
