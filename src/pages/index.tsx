import { Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { Theme } from '@material-ui/core/styles';
import { makeStyles } from'@material-ui/core/styles';
import React, { useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import LazyLoadComp from 'react-lazy-load-component';

import * as AppModel from '../models/AppModel';
import LoadingMsg from '../components/Loading';
import Banner from '../components/home/Banner';

const Content = React.lazy(() => import('../components/home/Content'));
const Footer = React.lazy(() => import('../components/home/Footer'));
const Subscribe = React.lazy(() => import('../components/home/Subscribe'));

const trackOutboundLinkClick = window.trackOutboundLinkClick;
const useStyles = makeStyles(
  (theme: Theme) => ({
    root: {
      textAlign: 'center',
      paddingTop: theme.spacing(20)
    },
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, 300px)',
      marginTop: '60px',
      alignItems: 'center',
      [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: '1fr'
      }
    },
    paper: {
      padding: theme.spacing(1),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      whiteSpace: 'nowrap',
      marginBottom: theme.spacing(1)
    },
    centered: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: 'auto',
      maxWidth: '800px',
      minWidth: '300px',
      textAlign: 'center'
    },
    divider: {
      margin: `${theme.spacing(2)}px 0`
    },
    banner: {
      display: 'flex',
      objectFit: 'cover',
      width: '100%',
      height: 'calc(100vh - 0px)',
      backgroundImage: 'url("./banner.jpg")',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center 0',
      color: 'white',
      justifyContent: 'flex-end',
      flexFlow: 'column nowrap'
    },
    bannerText: {
      fontFamily: 'Open Sans',
      color: 'white',
      bottom: '20%',
      marginBottom: '15vh',
      backgroundColor: '#00000044',
      fontWeight: 'bold'
    },
    logoanim: {
      width: '100vw',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'flex'
    },
    largeIcon: {
      width: 80,
      height: 60
    },
    body: {
      /*
      width: '100%',
      backgroundImage: 'url("./imgs/07-newsletter.png")', // DTC-scene3.png
      backgroundSize: 'cover',
      // backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'bottom 0px left'
      */
    },
    paperimg: {
      marginLeft: 'auto',
      marginRight: 'auto',
      height: 'auto',
      width: 'auto',
      maxWidth: '300px',
      minWidth: '200px',
      margin: 0,
      display: 'block',
      objectFit: 'contain',
      pointerEvents: 'none',
      [theme.breakpoints.down('sm')]: {
        paddingTop: `${theme.spacing(5)}px`
        // maxWidth: '80%'
      },
      [theme.breakpoints.down('xs')]: {
        maxWidth: '100px'
      }
    }
  }),
  { name: 'Home' }
);

export default function Home() {
  const store = useContext(AppModel.Context)!;
  const classes = useStyles({});

  // useEffect(() => {
  // const fp = (window as any).FloatingPrompt;
  /* if (fp)
      fp({
        width: '300px',
        text:
          "Do you like DTC? Don't forget to show your love on Product Hunt 🚀",
        saveInCookies: true,
        name: 'DTC',
        url: 'https://www.producthunt.com/posts/dinnertable-chat-3'
      }); */
  // }, []);

  // const { classes, store } = this.props;
  // TODO, only redirect at login action ( && store.auth.user!.)

  return (
    <React.Fragment>
      <Helmet title="Dinnertable.chat">
        <meta itemProp="name" content="Dinnertable.chat" />
        <meta name="og:url" content="https://www.dinnertable.chat" />
        <meta name="og:title" content="Dinnertable.chat" />
      </Helmet>
      <div>
        <Banner store={store} />
        
        <React.Suspense fallback={LoadingMsg()}>
          <Content />
        </React.Suspense>
        <div className="pagebody">
          <Grid
            container
            spacing={0}
            className={classes.container}
            id="subscribe"
          >
            <Grid item xs={2} sm={2} md={1} lg={1} className={classes.centered}>
              <img
                alt="newsletter owl"
                src="https://via.placeholder.com/150"
                data-src="./imgs/07-newsletter.png"
                className={classes.paperimg + ' lazyload'}
              />
            </Grid>
            <Grid item xs={2} sm={2} md={1} lg={1} className={classes.centered}>
              <LazyLoadComp fallback={<span/>}>
                <Subscribe />
              </LazyLoadComp>
            </Grid>
          </Grid>
          <br />
          <Typography variant="body1" style={{ marginTop: '1em' }}>
            Also follow us on{' '}
            <a
              href="https://twitter.com/dintablechat"
              onClick={trackOutboundLinkClick(
                'https://twitter.com/dintablechat'
              )}
            >
              Twitter
            </a>
            ,{' '}
            <a
              href="https://medium.com/dinnertablechat"
              onClick={trackOutboundLinkClick(
                'https://medium.com/dinnertablechat'
              )}
            >
              Medium
            </a>
            , and other platforms using the links in the footer!
          </Typography>
        </div>
      </div>
      <LazyLoadComp fallback={<span/>}>
        <Footer forceShow={true} />
      </LazyLoadComp>
    </React.Fragment>
  );
}
/*
<div style={{ marginTop: '3em' }}>
            <a
              href="https://goo.gl/forms/KaZBtAxKRs2M1dY62"
              onClick={window.trackOutboundLinkClick(
                'https://goo.gl/forms/KaZBtAxKRs2M1dY62'
              )}
              className="minorlink"
              style={{ textDecoration: 'none' }}
            >
              <Announcement /> help us out by taking a quick poll
            </a>
          </div>
*/
