import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid
} from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Theme } from '@material-ui/core/styles';
import DraftsIcon from '@material-ui/icons/ChatBubbleOutlineRounded';
import InboxIcon from '@material-ui/icons/MicRounded';
import { makeStyles } from'@material-ui/core/styles';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Reveal from 'react-reveal/Reveal';

import * as AppModel from '../../../models/AppModel';
import SMicPermissionsBtn from '../../menus/MicPermissionsBtn';

const useStyles = makeStyles(
  (theme: Theme) => ({
    layout: {
      width: '100%',
      marginLeft: 'auto',
      marginRight: 'auto',
      [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
        // width: 1100,
        // marginLeft: 'auto',
        // marginRight: 'auto',
      }
    },
    list: {
      fontSize: '1.2em'
    },
    btn: {
      marginLeft: '1.5em',
      width: 'auto',
      color: '#ffffff',
      fontSize: '1.2em'
      // color: theme.palette.secondary.main
    },
    cardGrid: {
      // padding: `${theme.spacing(4)}px 0`,
    },
    card: {
      marginLeft: 'auto',
      marginRight: 'auto',
      minWidth: '320px',
      width: '50vw',
      maxWidth: '500px',
      height: '100%',
      textAlign: 'center',
      flexDirection: 'column',
      backgroundColor: '#eceadb',
      [theme.breakpoints.down('md')]: {
        width: '80vw',
      },
      [theme.breakpoints.down('sm')]: {
        width: '100vw',
      }
    },
    cardMedia: {},
    cardContent: {
      flexGrow: 1
    },
    imgLink: {
      textDecoration: 'none'
    },
    icon: {
      marginRight:'.5em'
    }
  }),
  { name: 'SMicSelector' }
);

interface Props {
  store: AppModel.Type;
}

function ListItemLink(props: any) {
  return <ListItem button component="a" {...props} />;
}

export default observer(function SMicSelector(props: Props) {
  const store = props.store;
  const classes = useStyles({});
  const { t } = useTranslation();

  const [state, setState] = useState({ checkMic: false });

  // state = { noop: false };

  const onMic = () => {
    setState({ checkMic: true });
  };

  const onStart = () => {
    props.store.debate.setCharacter(1);
  };

  const handleListItemClick = (e, index) => {
    console.log('index', index);
    if (index === 0) onMic();
    if (index === 1) onStart();
  };

  return (
    <div className={classNames(classes.layout, classes.cardGrid)}>
      <Grid container spacing={0} justify="center">
        <Grid sm={12} md={12} lg={12} item>
          <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
            <div style={{ paddingTop: '2em' }} />
                <Button
                  variant="contained"
                  // size="small"
                  color="secondary"
                  className={classes.btn}
                  disabled={store.micAllowed}
                  onClick={event => handleListItemClick(event, 0)}
                > <InboxIcon className={classes.icon} />{!store.micAllowed ? 'Allow microphone' : 'Mic enabled'}
                </Button>
                <div style={{ paddingTop: '2em' }} />
                <Button
                  variant="contained"
                  // size="small"
                  color="secondary"
                  className={classes.btn}
                  disabled={!store.micAllowed}
                  onClick={event => handleListItemClick(event, 1)}
                >
                  <DraftsIcon className={classes.icon}/>Start Debate
                </Button>
              <div style={{ paddingTop: '2em' }} />
              {state.checkMic && (
                <div style={{ display: 'none' }}>
                  <SMicPermissionsBtn store={store} />
                </div>
              )}
            </CardContent>
            <CardActions style={{ justifyContent: 'center' }} />
          </Card>
        </Grid>
      </Grid>
    </div>
  );
});

/*
<CardMedia
className={classes.cardMedia}
// image={card.photo}
title={card.topic}
/>
*/
