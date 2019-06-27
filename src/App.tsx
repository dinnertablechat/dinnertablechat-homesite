import { observer } from 'mobx-react-lite';
import React, { Suspense, useEffect } from 'react';
import { withRouter } from 'react-router-dom';

import AppBar from './components/AppBar';
import AuthWrapper from './components/aws/AuthWrapper';
import LoadingMsg from './components/Loading';
import AppRouter from './components/Router';
import WorkerUpdate from './components/WorkerUpdate';
import * as TimeSerive from './services/TimeService';

// ---- fonts
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTwitter, fab, faTwitterSquare, faFacebookSquare, faInstagram, faMedium, faDiscord } from '@fortawesome/free-brands-svg-icons'
import { faCheckSquare, faEnvelopeSquare, faCompactDisc, faClipboard } from '@fortawesome/free-solid-svg-icons'
 
library.add(faTwitter, faTwitterSquare, faCheckSquare, faFacebookSquare, faInstagram, 
  faMedium, faEnvelopeSquare, faDiscord, faCompactDisc, faClipboard );
// ----------
/* var WebFont = require('webfontloader');
(function() {
  WebFont.load({
    custom: {
      families: ['Montserrat', 'Roboto Mono'],
      urls: ['/fonts.css']
    }
  });
})() */
// ----------

// import Index from './components/home/home';
// import { withRouter } from 'react-router';
interface Props {
  store: import('./models/AppModel').Type;
  history: any;
}
export default observer(function App(props: Props) {
  (window as any).__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true; // mui
  const store = props.store;
  const history = props.history;

  useEffect(() => {
    const path = (store.router.location as any).pathname;
    // console.log('path', path);

    const isTest = path === '/test' || path === '/test2';
    const isSaasDomain = window.location.hostname.match('debateplatform');
    if (isTest) return;

    const isHome = path === '/' || path === '';
    const isDebateTime = TimeSerive.isDuringDebate(store.isLive);
    // console.log('isHomeisHome', isHome, TimeSerive.isDuringDebate(store.isLive))
    if (!isHome) return; // j1, not sure if this fixes anything

    // App flow
    if (isSaasDomain) {
      store.router.push('/r');
    } else if (
      store.isStandalone() &&
      store.auth.isNotLoggedIn &&
      !localStorage.getItem('quickmatch')
    ) {
      store.router.push('/tutorial');
    } else if (localStorage.getItem('signup')) {
      // Auth guest to signup
      if (store.auth.isNotLoggedIn) {
        console.log('Auth guest to signup');
        store.auth.login();
      } else if (!store.isGuest() && !store.auth.isNotLoggedIn) {
        // console.log('finished Auth guest to signup');
        // localStorage.removeItem('signup');
      }
      // return <Loading />;
    } else if (store.isQuickmatch() && store.auth.isNotLoggedIn) {
      // Feature: force quickmatch flow
      console.log('isQuickmatch');
      localStorage.setItem('quickmatch', 'y');
      store.auth.doGuestLogin();
      // return <Loading />;
      // cant do this as it would cause quickmatch to bug
      // else if(s.auth.isAuthenticated()) s.router.push('/quickmatch');
    } else if (store.auth.isNotLoggedIn && isDebateTime) {
      // Feature: faster flow
      console.log('setting quickmatch');
      // localStorage.setItem('quickmatch', 'y');
      store.auth.doGuestLogin();
      //  return <Loading />;
    } else if (isHome && isDebateTime && store.auth.isAuthenticated()) {
      store.router.push('/quickmatch'); // /home
    }
  }, [store, store.auth.isNotLoggedIn, store.auth.user]);

  return (
    <WorkerUpdate store={store}>
      <AuthWrapper store={store} login={store.auth.doLogin} />
      <AppBar store={store} />
      <Suspense fallback={LoadingMsg()}>
        <AppRouter history={history} store={store} />
      </Suspense>
    </WorkerUpdate>
  );
});
