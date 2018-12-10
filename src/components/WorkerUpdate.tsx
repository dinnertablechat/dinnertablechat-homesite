import React from 'react';

import * as Store from '../models/AppModel';
import { observer } from 'mobx-react';
import HOC from './HOC';
import { inject } from 'mobx-react';
import { Typography } from '@material-ui/core';
import * as serviceWorker from '../serviceWorker';
import Button from '@material-ui/core/Button';
import QueueIcon from '@material-ui/icons/QueuePlayNext';

interface Props {
  store: Store.Type;
}

interface State {
  init: boolean;
}

//
var refreshing;
class WorkerUpdate extends React.Component<Props, any> {
  refresh = false;
  registration?: ServiceWorkerRegistration;
  constructor(props: Props) {
    super(props);
    this.state = { disableRefresh: false };
  }

  public componentWillMount() {
    const props: any = this.props;
  }

  public componentDidMount() {
    const onSuccess = (registration: ServiceWorkerRegistration) => {
      this.registration = registration;
      console.log('worker loaded');
    };
    const onUpdate = (registration: ServiceWorkerRegistration) => {
      if(registration) this.registration = registration;

      // #2
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true; // preventDevToolsReloadLoop
        window.location.reload(); // true
      });

      this.setState({ showReload: true }); // , registration: registration
    };

    // serviceWorker.unregister();
    serviceWorker.register({ onSuccess, onUpdate });

    // Cachebust SW
    // setInterval(() => bust(), 1000 * 60);
    // setTimeout(bust, 2000);

    // #1
    /* navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true; // preventDevToolsReloadLoop
      window.location.reload(); // true
    });*/
  }

  private onRefreshClick = e => {
    const registration = this.registration!;
    // var r = confirm('New dinnertable update available!');
    if (registration.waiting) registration.waiting.postMessage('skipWaiting');
    else alert('no registration waiting');
    this.setState({disableRefresh: true});
    // bust();
    // setTimeout(() => window.location.reload(true), 1000);
    console.log('worker updated');
  };

  public render() {
    const { store } = this.props;
    if (this.state.showReload) {
      return (
        <div style={{textAlign:'center', paddingTop:'60px', backgroundColor:'#888888', height:'100vh', width:'100vw'}}>
            <Typography>Dinnertable.chat has new updates!</Typography>
          <Button
            onClick={this.onRefreshClick}
            variant="contained"
            color="primary"
            size="large"
            disabled={this.state.disableRefresh}
          >
            One-click Update
            <QueueIcon style={{ marginLeft: '8px' }} />
          </Button>
        </div>
      );
    } else return <>{this.props.children}</>;
  }
}

export default inject('store')(observer(WorkerUpdate));
// withOAuth

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA

function bust() {
  navigator.serviceWorker.getRegistrations().then(registrationsArray => {
    if (registrationsArray.length > 0) registrationsArray[0].update();
  });
}