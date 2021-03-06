declare module 'jss-preset-default';
declare module 'react-jss/*';
declare var luxon: import('luxon');
// declare var trackOutboundLinkClick: any;
// declare var trackOutboundLink: any;

declare module 'json!*' {
  let json: any;
  export = json;
}

declare interface mixpanel {
  track(name: string);
}

declare function gtag(
  action: string,
  event: string,
  eventCategory?: any,
  eventAction?: any,
  eventLabel?: any,
  eventValue?: any
): void;

declare function trackOutboundLink(
  url: string,
  interactive?: boolean,
  newWin?: boolean
): void;
declare function trackOutboundLinkClick(
  url: string,
  interactive?: boolean,
  newWin?: boolean
): (e: any) => any;

declare global {
  declare var luxon: import('luxon');
  interface Window {
    gtag: typeof gtag;
    mixpanel: mixpanel;
    trackOutboundLink: typeof trackOutboundLink;
    trackOutboundLinkClick: typeof trackOutboundLinkClick;
    luxon: import('luxon');
  }
}

interface Window {
  gtag: typeof gtag;
  mixpanel: mixpanel;
  trackOutboundLink: typeof trackOutboundLink;
  trackOutboundLinkClick: typeof trackOutboundLinkClick;
  luxon: import('luxon');
}
