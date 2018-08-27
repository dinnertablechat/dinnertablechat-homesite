import React from 'react';
import { withStyles, createStyles, WithStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import * as Store from '../models/AppModel'
import { observer } from 'mobx-react';
import AuthWrapper from './aws/AuthWrapper'

const styles = createStyles({
  root: {
    flexGrow: 1,
  },
  flex: {
    flexGrow: 1,
    fontFamily: 'Montserrat!important',
    fontWeight: 'bolder'
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
});

interface Props extends WithStyles<typeof styles> {
  store: Store.Type
}

function onClick(store: Store.Type) {
  // store.setTitle('clicked ' + Math.round(Math.random() * 10) )
  // store.router.push('/signin')
  store.auth.login()

}
/*
<IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
            <MenuIcon />
          </IconButton>
*/

function ButtonAppBar(props:Props) {
  const { classes, store } = props;
  return (
    <div className={classes.root}>
      <AppBar position="fixed" color="default">
        <Toolbar variant="dense">
          <img src="./logos/appbar-logo-color.png" style={{height:'3em'}}/>
          <Typography variant="title" color="inherit" className={classes.flex}>
          </Typography>
          <Button color="inherit" onClick={ () => onClick(store) }>Login</Button>
          <AuthWrapper store={store} login={store.auth.doLogin} />
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default withStyles(styles)(observer(ButtonAppBar));