import { types } from 'mobx-state-tree';
import { RouterModel } from 'mst-react-router';
import AuthModel from './AuthModel';
import DebateModel from './DebateModel';
import { Instance } from 'mobx-state-tree';
import React from 'react';
import uuid from 'short-uuid';

// let cacheIsLive: boolean | null = null;
function isLive(): boolean {
  // if (cacheIsLive !== null) return cacheIsLive;
  const h = window.location.hostname;
  const live = h.indexOf('test') === -1 && h.indexOf('dinnertable.chat') !== -1;
  // cacheIsLive = live;
  return live;
}

const AppModel = types
  .model({
    auth: AuthModel,
    debate: DebateModel,
    router: RouterModel,
    showNav: true,
    _isStandalone: false,
    dailyOpen: false, // only use for invalidation
    micAllowed: false,
    isLive: isLive(),
    isSaas: false
  })
  .views(self => ({
    /* isDailyOpen() {
      return self.dailyOpen || TimeService.
    },*/
    getRID() {
      let rid = localStorage.getItem('guestSeed'); // reuse guest seed
      if (!rid) {
        rid = uuid.generate();
        console.log('guestSeed generate seed', rid);
        localStorage.setItem('guestSeed', rid);
      }
      return rid;
    },
    isGuest() {
      if (!self.auth.user) return false;
      return self.auth.user!.email === 'guest@dinnertable.chat';
    },
    isAdmin() {
      return (
        self.auth.user && self.auth.user!.id === 'Google_111841421166386376573'
      );
    },
    isStandalone() {
      if (self._isStandalone) return true;

      const enabledOnSafari = (window.navigator as any).standalone === true;
      const result =
        window.matchMedia('(display-mode: standalone)').matches ||
        enabledOnSafari ||
        !!window['cordova'] ||
        document.URL.indexOf('file://') > -1 ||
        document.URL.indexOf('FILE://') > -1 ||
        navigator.userAgent === 'Mozilla/5.0 Google' ||
        navigator.userAgent === 'Mozilla/5.0 Google PWA';
      if (result) (self as any).setStandalone(); // cache
      return result;
    },
    isQuickmatch() {
      const param = new URLSearchParams(window.location.search);
      return param.has('quickmatch');
    }
  }))
  .actions(self => ({
    setMicAllowed(isEnabled: boolean) {
      self.micAllowed = isEnabled;
    },
    setStandalone() {
      self._isStandalone = true;
    },
    setDailyOpen(open: boolean) {
      self.dailyOpen = open;
    },
    setSaas(isSaas: boolean) {
      self.isSaas = isSaas;
    },
    gotoHomeMenu() {
      self.showNav = true;
      // if (!self.debate.isTest)
      self.router.push('/home');
      // else self.router.push('/test');
    },
    showNavbar() {
      self.showNav = true;
    },
    hideNavbar() {
      self.showNav = false;
    },
    login() {
      if (self.isGuest()) self.auth.logout();
      self.auth.login();
    },
    // Covers guest login action\ as well
    authenticated(signedIn: boolean) {
      if (self.isSaas) {
        self.router.push('/saas');
        return;
      }

      const path = (self.router.location as any).pathname;
      const isTest = path === '/test' || path === '/test2';
      if (isTest) return;

      const isSigninPath = path === '/signin' || path === '/callback';
      // const isHome = path === '/' || path === '';
      // const homeAuthed =
      //  signedIn && isHome && TimeService.isDuringDebate(self.isLive);
      // console.log('isHome', isHome, homeAuthed);
      // if(!isHome) return; // j1, not sure if this fixes anything
      // localStorage.removeItem('signup');
      // if (!signedIn) return;
      console.log(
        'authenticated, signedIn, isSigninPath',
        signedIn,
        isSigninPath
      );

      if (localStorage.getItem('quickmatch')) {
        localStorage.removeItem('quickmatch');
        self.router.push('/quickmatch');
        // prevent being redirected when its not login time
        // prevent redirect for if being signed in and not signedIn yet
        // NOTE: DONT MESS WITH THIS
      } else if (!isSigninPath && !signedIn) {
        //  && !homeAuthed
        // signed in on not home
        return;
      } else if (self.isStandalone()) self.router.push('/home');
      else if (self.isGuest()) {
        self.router.push('/quickmatch');
      } else self.router.push('/tutorial');
      /* else if (
        localStorage.getItem('quickmatch') &&
        self.auth.isAuthenticated() &&
        self.isGuest()
      ) {
        // localStorage.setItem('quickmatch', 'y');
        // store.router.push('/tutorial');
        self.router.push('/quickmatch'); // just do it
      }*/

      // (self as any).signedIn();
    }
  }));

export type Type = Instance<typeof AppModel>;

export const create = (routerModel: RouterModel, fetcher: any) =>
  AppModel.create(
    {
      auth: AuthModel.create({}),
      debate: DebateModel.create({}),
      router: routerModel
    },
    {
      fetch: fetcher,
      alert: m => console.log(m) // Noop for demo: window.alert(m)
    }
  );

export const Context = React.createContext<Type | null>(null);
