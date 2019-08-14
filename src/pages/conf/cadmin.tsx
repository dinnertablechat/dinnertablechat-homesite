import { Button, Typography } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/styles';
import ConfAdmin from 'components/conf/ConfAdminPanel';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import Reveal from 'react-reveal/Reveal';

import * as AppModel from '../../models/AppModel';
import ConfAdminPanelDash from 'components/conf/ConfAdminPanelDash';
import ConfAdminPanelSlides from 'components/conf/ConfAdminPanelSlides';

import QRCode from 'qrcode.react';

const useStyles = makeStyles(
  (theme: Theme) => ({
    pagebody: {
      backgroundColor: '#ddd1bb',
      minHeight: '100vh'
    },
    container: {
      marginTop: '0px',
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '100%',
      maxWidth: '100%',
      padding: '1em 1em 0 1em',
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
      maxWidth: '100vw',
      textAlign: 'left',
      margin: '0 auto',
      padding: `0`
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
      zIndex: 0,
      // backgroundColor: '#1b6f7b',
      // padding: theme.spacing(6)
      width: '100%',
      margin: '2em auto 0.07em auto',
      // position: 'absolute',
      // bottom: '.15em',
      textAlign: 'center'
    },
    linkhome: {
      color: theme.palette.primary.dark
    },
    stepLabel: {
      fontSize: '1.1em !important',
      color: '#ffffff !important',
      fontWeight: 'bold'
    },
    verticalCenter: {
      textAlign: 'center',
      margin: '1.4em auto 0 auto',
      // position: 'absolute',
      // minWidth: '100%',
      width: '100%',
      maxWidth: '1400px',
      minHeight: 'calc(100vh - 250px)'
      // top: '50%',
      // left: '50%',
      /* transform: 'translateY(-50%) translateX(-50%)',
      '@media screen and ( max-height: 495px )': {
        bottom: '1em',
        top: 'auto'
      }*/
    },
    herotext: {
      fontSize: '1.2em',
      fontWeight: 400,
      paddingBottom: '0',
      width: '400px',
      [theme.breakpoints.down(500)]: {
        fontSize: '4.85vw',
        width: '100vw'
      }
    },
    heroLogo: {
      height: '3em',
      cursor: 'pointer',
      [theme.breakpoints.down(480)]: {
        width: '90vw'
      }
    },
    heroLogoText: {
      color: '#9f7b74',
      fontSize: '2.6em',
      cursor: 'pointer',
      [theme.breakpoints.down(550)]: {
        fontSize: '8vw'
      }
    }
  }),
  { name: 'CAdmin' }
);

interface Props {
  isTest?: boolean;
  id: string;
}

interface State {
  view: 'slides' | 'dash';
  show: boolean;
  kill: boolean;
}

const PAGE_NAME = 'DialogMixer';

export default observer(function CAdmin(props: Props) {
  const store = useContext(AppModel.Context)!;
  const classes = useStyles({});
  const { t } = useTranslation();

  const [state, setState] = useState<State>({
    view: 'slides',
    show: false,
    kill: false
  });

  const id = props.id;

  const isAdmin = store.auth.isAdmin();

  // console.log(store.auth.snapshot());

  // Guest login
  useEffect(() => {
    store.hideNavbar();
  }, []);

  useEffect(() => {
    // already redirecting to login
    if (state.kill) return;
    if (!store.auth.isAuthenticated()) return;

    if (!isAdmin) {
      console.log('isAdmin', isAdmin);
      window.alert('Not logged in as an administrator');
      store.auth.logoutLogin();
      setState(p => ({ ...p, kill: true }));
    } else {
      // if (store.auth.isNotLoggedIn) return;
      console.log('Admin user:', store.auth.user);
    }
    // console.log('aa', store.auth.isAuthenticated , !store.auth.isNotLoggedIn)
    // if (store.auth.isAuthenticated()) return;
  }, [store.auth.isNotLoggedIn, store.auth.user, isAdmin]);

  useEffect(() => {
    // store.setSaas(true);

    const isTest = !!localStorage.getItem('test');
    localStorage.removeItem('test');

    if (isTest) console.log('props.isTest', isTest);
    if (isTest !== store.debate.isTest) {
      store.debate.setTest(isTest);
    }
    handleReset();

    window.gtag('event', 'saas_debate_match_menu', {
      event_category: 'splash',
      guest: store.isGuest()
    });
  }, []);

  const handleReset = () => {
    if (store.conf.positions) store.conf.resetQueue();
  };

  if (store.auth.isNotLoggedIn) {
    store.auth.login();
    return (
      <div className={classes.pagebody}>
        <h3>Authorizing...</h3>
      </div>
    );
  }

  let step = 0;
  const posBit = state.show ? 1 : 0;
  step = posBit;

  if (step === 1) {
    console.log('move to next step');
  }

  const show = () => {
    setState(p => ({ ...p, show: true }));
  };

  const toggleView = () => {
    if (state.view !== 'slides') setState(p => ({ ...p, view: 'slides' }));
    else setState(p => ({ ...p, view: 'dash' }));
  };

  const viewComp =
    state.view === 'dash' ? ConfAdminPanelDash : ConfAdminPanelSlides;

  const i18Url = t(`conf-${id}-optional-url`);

  // url gen
  const isMixer = window.location.hostname.match('mixer.');
  let url = window.location.origin + '/c/' + id;
  if(isMixer) url = window.location.origin + '/' + id; // use root
  if (i18Url.indexOf('http') !== -1) url = i18Url;

  return (
    <>
      <Helmet title={PAGE_NAME}>
        <meta itemProp="name" content={PAGE_NAME} />
        <meta name="og:title" content={PAGE_NAME} />
        <meta name="title" property="og:title" content={PAGE_NAME} />
      </Helmet>
      <div className={classes.pagebody}>
        <main className={classes.container}>
          {/* Hero unit */}
          <div className={classes.heroUnit}>
            <div className={classes.heroContent}>
              {store.auth.isAdmin() ? (
                <button onClick={() => store.auth.logout()}>logout</button>
              ) : (
                'not an admin'
              )}
              {
                <button onClick={() => toggleView()}>
                  switch to {state.view === 'slides' ? 'dash' : 'slides'}
                </button>
              }
              {props.isTest && <h2>TEST MODE (/test)</h2>}
              <Typography
                variant="h1"
                align="left"
                color="textSecondary"
                className={classes.heroLogoText}
                gutterBottom
              >
                {PAGE_NAME} Admin
              </Typography>
              {step === 0 && (
                <Typography
                  className={classes.herotext}
                  variant="h3"
                  align="left"
                  color="textSecondary"
                  gutterBottom
                >
                  Talk to people with different opinions.
                  <br />
                  Discussion via mixed viewpoint matchmaking.
                </Typography>
              )}
            </div>
          </div>

          {step === 0 && (
            <div className={classes.verticalCenter}>
              <QRCode value={url} />
              <br />
              <br />
              <Reveal effect="fadeInUp" duration={2200}>
                <Typography
                  variant="h4"
                  align="center"
                  color="textSecondary"
                  gutterBottom
                >
                  To start matching, please visit:
                </Typography>
                <Typography
                  variant="h2"
                  align="center"
                  color="textSecondary"
                  gutterBottom
                >
                  {url}
                </Typography>
                <Button
                  variant="contained"
                  // size="small"
                  color="secondary"
                  onClick={show}
                >
                  Show Results
                </Button>
              </Reveal>
            </div>
          )}
          {step === 1 && (
            <div
              style={{ marginBottom: '2em' }}
              className={classes.verticalCenter}
            >
              <Reveal effect="fadeInUp" duration={1100}>
                <ConfAdmin id={id} store={store} view={viewComp} />
              </Reveal>
            </div>
          )}
        </main>
        <div className={classes.footer}>
          <b>
            Powered by{' '}
            <a
              href="https://www.newdialog.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              NewDialog.org
            </a>
          </b>
        </div>
      </div>
    </>
  );
});
