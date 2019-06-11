// @ts-ignore
import { observer } from 'mobx-react-lite';
import React, { lazy } from 'react';
import { Redirect, Route, Router, Switch } from 'react-router-dom';

import * as AppModel from '../models/AppModel';
import SClosedDialog from './saas/menus/SClosedDialog';

const AsyncHome = lazy(() => import('./home/home'));
const AsyncPlay = lazy(() => import('./menus/MenuHome'));
const AsyncPrivacy = lazy(() => import('./pages/Privacy'));
const AsyncEducation = lazy(() => import('./pages/EducationHome'));
const AsyncMediaKit = lazy(() => import('./pages/MediaKit'));
const AsyncDebate = lazy(() => import('./debate/DebateRouter'));
const AsyncTester = lazy(() => import('./debate/DebateTester'));
const UserHome = lazy(() => import('./menus/dash/UserHome'));
const DebateFeedback = lazy(() => import('./debate/DebateFeedback'));
const GettingStarted = lazy(() => import('./menus/GettingStarted'));
const AuthSignin = lazy(() => import('./aws/AuthSignin'));

const Saas = lazy(() => import('./saas/menus/SRouter'));
const SMenuHome = lazy(() => import('./saas/menus/SMenuHome'));

const AsyncPitch = lazy(() => import('./saas/pitch/SPitch'));

// https://news.ycombinator.com/item?id=19449279
// const scrollToTop = () => document.getElementById('root').scrollIntoView();

const NoMatch = ({ location }) => (
  <div>
    <h1>...</h1>
    <h3>
      No page match for <code>{location.pathname}</code>
    </h3>
    <p>
      <a href="/">Return home</a>
    </p>
  </div>
);

// <Route component={NoMatch} />
const DTCRouter = ({
  history,
  store
}: {
  history: any;
  store: AppModel.Type;
}) => {
  const live = store.isLive;
  return (
    <Router history={history}>
      <Switch>
        <Redirect from="/education" to="/campus" />
        <Redirect from="/signout" to="/" />
        <Redirect from="/play" to="/home" /> {/* legacy route */}
        <Redirect from="/CALLBACK" to="/callback" />
        <Redirect from="/signout" to="/" />
        <Route exact={true} path="/" component={AsyncHome} />
        <Route exact={true} path="/about" component={AsyncHome} />
        <Route exact={true} path="/callback" component={AuthSignin} />
        <Route exact={true} path="/signin" component={AuthSignin} />
        <Route exact={true} path="/feedback" component={DebateFeedback} />
        <Route exact={true} path="/tutorial" component={GettingStarted} />
        <Route path="/press" component={AsyncMediaKit} />
        <Route path="/privacy" component={AsyncPrivacy} />
        <Route path="/campus" component={AsyncEducation} />
        <Route path="/home" component={UserHome} />
        <Route path="/quickmatch" component={AsyncPlay} />
        <Route path="/match" component={AsyncDebate} />
        <Route path="/hosting" component={AsyncPitch} />
        <Route exact={true} path="/saas" component={SMenuHome} />
        {!live && (
          <Route exact={true} path="/saasend" component={SClosedDialog} />
        )}
        {!live && <Route exact={true} path="/saasmatch" component={Saas} />}
        {!live && <Route exact={true} path="/test2" component={AsyncTester} />}
        {!live && (
          <Route
            exact={true}
            path="/test"
            render={() => {
              localStorage.setItem('test', 'y');
              return <AsyncPlay />;
            }}
          />
        )}
        <Route exact={false} path="/" render={() => <Redirect to="/" />} />
      </Switch>
    </Router>
  );
};

const authenticated = (
  store: AppModel.Type,
  Component: React.LazyExoticComponent<any>
) => {
  const isAuth = store.auth.isAuthenticated();
  // console.log('store.auth.loggedIn', isAuth);
  if (isAuth) return <Component />;
  return <div>Loading...</div>;
};

function Loading(props: any) {
  if (props.error) {
    return (
      <div>
        Error! <button onClick={props.retry}>Retry</button>
      </div>
    );
  } else if (props.pastDelay) {
    return <div>Loading...</div>;
  } else {
    return null;
  }
}

/*
<Route path="/rtc" component={RTCHome}/>
<DefaultRoute component={Home} />
*/
export default observer(DTCRouter);

/*
<Route
        exact={true}
        path="/signout"
        render={() => {
          // PATCH, redirects not working
          store.router.push('/');
          return null;
        }}
      />
*/
