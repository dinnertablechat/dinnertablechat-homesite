import * as React from 'react';
import { withStyles, createStyles, WithStyles } from '@material-ui/core/styles';
import withRoot from '../../withRoot';

import Lottie from 'react-lottie';
import { observer } from 'mobx-react';

import ArrowDown from '@material-ui/icons/KeyboardArrowDown';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';

const logoData = require('../../assets/logo.json');

const styles = (theme: any) =>
  createStyles({
    root: {
      textAlign: 'center',
      paddingTop: theme.spacing.unit * 20
    },
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gridGap: `${theme.spacing.unit * 3}px`
      // gridAutoFlow: 'column',
      // gridAutoColumns: '200px'
    },
    paper: {
      padding: theme.spacing.unit,
      textAlign: 'center',
      color: theme.palette.text.secondary,
      whiteSpace: 'nowrap',
      marginBottom: theme.spacing.unit
    },
    centered: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: 'auto',
      maxWidth: '800px',
      minWidth: '300px'
    },
    centeredDown: {
      marginLeft: 'auto',
      marginRight: 'auto',
      paddingBottom: '5em',
      color: '#ffffff88',
      textAlign: 'center'
    },
    divider: {
      margin: `${theme.spacing.unit * 2}px 0`
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
      // justifyContent: 'center',
      justifyContent: 'flex-end',
      flexFlow: 'column nowrap'
    },
    bannerText: {
      fontFamily: 'Open Sans',
      color: 'white',
      // position: 'absolute',
      bottom: '20%',
      marginBottom: '15vh',
      backgroundColor: '#00000044',
      fontWeight: 'bold'
      // left: ''
    },
    logoanim: {
      width: '100vw',
      maxWidth: '600px',
      // minHeight: '300px',
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'flex'
    },
    largeIcon: {
      width: 80,
      height: 60
    }
  });

interface Props extends WithStyles<typeof styles> {
}

@observer
class Index extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <div className={classes.banner}>
          <div className={classes.centeredDown}>
            <Button href="#intro" size="small" variant="contained" color="primary">
              Learn More
            </Button>
            <br />
            <a href="#intro">
              <IconButton style={{ height: '9em', width: '9em' }}>
                <ArrowDown style={{ fontSize: '9em' }} />
              </IconButton>
              <div id="intro" style={{ height: 0 }} />
            </a>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withRoot(withStyles(styles)(Index));
