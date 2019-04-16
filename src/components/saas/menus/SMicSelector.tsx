import * as React from 'react';
import classNames from 'classnames';
import { createStyles, WithStyles, Theme } from '@material-ui/core/styles';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography
} from '@material-ui/core';
import * as AppModel from '../../../models/AppModel';
import * as TopicInfo from '../../../utils/TopicInfo';
import { useTranslation } from 'react-i18next';
import { useTheme, makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  layout: {
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    [theme.breakpoints.up(1100 + theme.spacing.unit * 3 * 2)]: {
      // width: 1100,
      // marginLeft: 'auto',
      // marginRight: 'auto',
    }
  },
  btn: {
    marginLeft: '1.5em',
    width: '8em'
    // color: theme.palette.secondary.main
  },
  cardGrid: {
    // padding: `${theme.spacing.unit * 4}px 0`,
  },
  card: {
    marginLeft: 'auto',
    marginRight: 'auto',
    minWidth: '300px',
    width: '50vw',
    maxWidth: '500px',
    height: '100%',
    textAlign:'center',
    // display: 'flex',
    flexDirection: 'column'
    // width: '100%'
    // width:'auto!important'
  },
  cardMedia: {
    /// paddingTop: '44.25%' // 16:9
  },
  cardContent: {
    flexGrow: 1
  },
  imgLink: {
    textDecoration: 'none'
  }
}), { withTheme: true, name: 'PositionSelector' });

interface Props {
  store: AppModel.Type;
}

export default function SMicSelector(props: Props) {
  const store = props.store;
  const classes = useStyles({});
  const { t } = useTranslation();

  // state = { noop: false };

  const onSelect = (position: number, card: TopicInfo.Card) => {
    props.store.debate.setCharacter(1);
    props.store.debate.setPosition(position, card.id);
  };

  return (
    <div className={classNames(classes.layout, classes.cardGrid)}>
      <Grid container spacing={0} justify="center">
        
          <Grid sm={10} md={10} lg={10} item>
            <Card className={classes.card}>
              <CardContent className={classes.cardContent}>
                <Typography variant="h5">123</Typography>
              </CardContent>
              <CardActions style={{justifyContent: 'center'}}>
                
                  <Button
                    variant="contained"
                    // size="small"
                    color="secondary"
                    className={classes.btn}
                    onClick={() => null}
                  >
                    test
                  </Button>

              </CardActions>
            </Card>
          </Grid>
       
      </Grid>
    </div>
  );
}

/*
<CardMedia
className={classes.cardMedia}
// image={card.photo}
title={card.topic}
/>
*/