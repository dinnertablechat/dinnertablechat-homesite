import { Button, Step, StepContent, Stepper, Typography } from '@material-ui/core';
import StepButton from '@material-ui/core/StepButton';
import { Theme } from '@material-ui/core/styles';
import { makeStyles } from'@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import * as AppModel from '../models/AppModel';
import * as Times from '../services/TimeService';
import { Auther } from '../components/Auther';
import Footer from '../components/home/Footer';
import CharacterSelection from '../components/menus/CharacterSelection';
import AppFloatMenu from '../components/menus/dash/AppFloatMenu';
import MicPermissionsBtn from '../components/menus/MicPermissionsBtn';
import PositionSelector from '../components/menus/PositionSelector';

const useStyles = makeStyles((theme: Theme) => ({
  pagebody: {
    backgroundColor: theme.palette.primary.light,
    minHeight: '100vh'
  },
  container: {
    marginTop: '0px',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: 'auto',
    maxWidth: '1000px',
    minWidth: '300px'
  },
  appBar: {
    position: 'relative'
  },
  icon: {
    marginRight: theme.spacing(2)
  },
  heroUnit: {
    // backgroundColor: theme.palette.background.paper,
  },
  heroContent: {
    maxWidth: 800,
    textAlign: 'center',
    margin: '0 auto',
    padding: `${theme.spacing(8)}px 0 ${theme.spacing(1) * 0}px`
  },
  micButton: {
    maxWidth: 600,
    textAlign: 'center',
    margin: '0 auto',
    padding: `0px 0 0px`
  },
  stepper: {
    padding: theme.spacing(1) * 0
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: theme.palette.primary.dark
  },
  actionsContainer: {
    marginBottom: theme.spacing(2)
  },
  resetContainer: {
    padding: theme.spacing(3)
  },
  footer: {
    backgroundColor: '#1b6f7b',
    padding: theme.spacing(6)
  },
  linkhome: {
    color: theme.palette.primary.dark
  },
  stepLabel: {
    fontSize: '1.1em !important',
    color: '#ffffff !important',
    fontWeight: 'bold'
  }
}));

interface Props {
  isTest?: boolean;
}

function getSteps() {
  return ['Pick your character to start', 'Select Postion']; // , 'Set contribution']
}

function onHistory(store: AppModel.Type) {
  store.router.push('/home');
}

function getStepContent(step: number, store: AppModel.Type) {
  switch (step) {
    case 0:
      return <CharacterSelection store={store} />;
    case 1:
      return <PositionSelector store={store} />;
    default:
      return (
        <Typography>
          Hmm, something went wrong. Please try again after refreshing the page.
        </Typography>
      );
  }
}

const renderStepButtons = (activeStep, classes, handleBack) => {
  return null;
  /* return (
    <div className={classes.actionsContainer}>
      <Button
        disabled={activeStep === 0}
        onClick={handleBack}
        className={classes.button}
        color="secondary"
      >
        Reset Selections
      </Button>
    </div>
  ); */
};

export default observer(function MenuHome(props: Props) {
  const store = useContext(AppModel.Context)!;
  const classes = useStyles({});
  const { t } = useTranslation();
  // const [state, setState] = React.useState({ open: false, activeStep: 0 });

  useEffect(() => localStorage.removeItem('quickmatch'), []);

  useEffect(() => {
    const isTest = !!localStorage.getItem('test');
    localStorage.removeItem('test');

    if (isTest) console.log('props.isTest', isTest);
    if (!Times.isDuringDebate(store.isLive)) {
      store.router.push('/home');
    }
    if (isTest !== store.debate.isTest) {
      store.debate.setTest(isTest);
    }
    handleReset();

    if(window.gtag) window.gtag('event', 'debate_match_menu', {
      event_category: 'splash',
      guest: store.isGuest()
    });
  }, []);

  const handleBack = () => {
    handleReset();
  };

  const handleReset = () => {
    store.debate.resetQueue();
  };

  /* user is always logged in
  if (store.auth.isNotLoggedIn) {
    store.router.push('/');
    return <div />;
  } */
  let step = 3;

  if (store.debate.contribution === -1) step = 2; // skip contribution
  if (!store.debate.topic || store.debate.position === -1) step = 1;
  if (store.debate.character === -1) step = 0;

  // if(store.debate.position !== -1 && store.debate.contribution !== -1) step = 2;
  // if(store.debate.character !== -1) step = 3;
  if (step === 3 && store.micAllowed) store.router.push('/match');
  // console.log('step', step)
  const steps = getSteps();

  const handleStep = step2 => () => {
    store.debate.resetQueue();
  };

  return (
    <Auther>
      <div className={classes.pagebody}>
        <main className={classes.container}>
          {/* Hero unit */}
          <div className={classes.heroUnit}>
            <div className={classes.heroContent}>
              {props.isTest && <h2>TEST MODE (/test)</h2>}
              <Typography
                style={{
                  fontSize: '2.5em',
                  paddingBottom: '0',
                  color: '#ffffff'
                }}
                variant="h3"
                align="center"
                color="textSecondary"
              >
                Quickmatch
              </Typography>
              <Typography
                style={{
                  fontSize: '1.2em',
                  paddingBottom: '0',
                  color: '#ffffff'
                }}
                variant="h3"
                align="center"
                color="textSecondary"
                gutterBottom
              >
                Get matched with people with different opinions and talk with
                them!
              </Typography>
              {store.isGuest() && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => store.router.push('/about')}
                  style={{
                    lineHeight: '1.4em',
                    backgroundColor: '#93cad2',
                    marginRight: '12px'
                  }}
                >
                  About Us
                </Button>
              )}
              <Button
                // className={classes.linkhome}
                // color="secondary"
                // style={{backgroundColor:'#a3a3a3'}}
                style={{ lineHeight: '1.4em', backgroundColor: '#93cad2' }}
                variant="contained"
                color="secondary"
                onClick={() => onHistory(store)}
              >
                Profile History and Awards
              </Button>
            </div>
          </div>
          {/* End hero unit */}
          <div className={classes.stepper}>
            <Stepper
              color="primary"
              activeStep={step}
              orientation="vertical"
              style={{ backgroundColor: '#2db8cc' }}
            >
              {steps.map((label, index) => {
                return (
                  <Step key={label}>
                    <StepButton
                      className={classes.stepLabel}
                      onClick={handleStep(index)}
                    >
                      {label}
                    </StepButton>
                    <StepContent>
                      {getStepContent(index, store)}
                      {step === 0
                        ? null
                        : renderStepButtons(step, classes, handleBack)}
                    </StepContent>
                  </Step>
                );
              })}
            </Stepper>
          </div>
          <div className={classes.micButton}>
            <MicPermissionsBtn store={store} />
          </div>
        </main>
        <Footer className={classes.footer} />
        <AppFloatMenu />
      </div>
    </Auther>
  );
});

// took this out as height is a little wierd on page
// <Footer className={classes.footer}/>
