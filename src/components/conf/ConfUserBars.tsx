import { Theme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/styles';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsiveBar } from '@nivo/bar';
import * as AppModel from '../../models/AppModel';
import { ResponsiveBubble } from '@nivo/circle-packing';
import { getOtherTopics } from 'utils/TopicInfo';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles(
  (theme: Theme) => ({
    layout: {
      width: '100%',
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    layout2: {
      width: '100%',
      height: '64px',
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    btn: {
      color: '#ffffff',
      fontSize: '1.1em'
    },
    submit: {
      width: '100px',
      fontSize: '1.1em',
      color: '#ffffff'
    }
  }),
  { name: 'ConfUserBars' }
);

interface Props {
  store: AppModel.Type;
  data: any;
  qdata: any;
  id: string;
  questions: any;
}

export default function ConfUserBars(props: Props) {
  const store = props.store;
  const classes = useStyles({});
  const { t } = useTranslation();
  // const [state, setState] = React.useState<State>({ data: [], checks: 0 });

  const data2 = props.data.members.map((x, i) => ({ name: i, answers: x }));

  /*
  qdata {
  0:
    us-east-1:996b8af9-c5bd-41c8-bee7-4068792f28e0:
      conf-bbb-q0-id: 0
      conf-bbb-q1-id: 1
  */

  // get ansers
  const tdata = props.questions; // getOtherTopics(props.id, t, 'conf');
  // debugger;

  // Users into question response totals
  // ex [{id: "conf-pub1-q0-id", Yes: 11, No: 2}]
  const keys: string[] = [];
  const data3 = tdata.map((q, qindex) => {
    const pss = q.positions;
    const answ = {};
    pss.forEach((qr, i) => {
      // console.log('q', qr, i);
      if (keys.indexOf(qr) === -1) keys.push(qr);
      answ[qr] = data2.filter((u, index) => u.answers[q.id] === i).length;
    });
    return { id: (qindex + 1).toString(), ...answ, proposition: q.proposition };
  });

  // console.log('data3', data3, tdata);

  // return null;
  // console.log(JSON.stringify(valo, null, 2));

  return (
    <div className={classes.layout}>
      {data3.map((r, index) => {
        // console.log('r', r);
        return (
          <>
            <Typography variant="body1">
              {r.proposition}
            </Typography>
            <div key={index} className={classes.layout2}>
              {makeBar([r], keys, index, false)} 
            </div>
          </>
        );
      })}
    </div>
  );
}
// index === data3.length - 1
const Notes = (props: any) => {
  const { bars, xScale, yScale, data } = props;
  // debugger
  return (
    <React.Fragment>
      {data.map((bar, key) => {
        return (
          <foreignObject width="100%" height="200" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility">
            <span>{bar.proposition}</span>
          </foreignObject>
        );
      })}
    </React.Fragment>
  );
};

function makeBar(data3: any, keys: any, key: number, showLegend: boolean) {
  return (
    <ResponsiveBar
      layers={
        [
          'grid',
          // 'axes',
          'bars',
          // Notes,
          'markers',
          'legends',
          'annotations'
        ] as any
      }
      key={key}
      data={data3}
      keys={keys}
      axisBottom={null}
      axisLeft={null}
      indexBy={'id'}
      reverse={true}
      margin={{ top: 3, right: 20, bottom: 10, left: 20 }}
      padding={0.1}
      layout="horizontal"
      colors={{ scheme: 'nivo' }}
      tooltip={({ id, value, color }) => (
        <strong style={{ color: 'black' }}>{value + ' ' + id}</strong>
      )}
      label={({ id, value }) => value + ' ' + id}
      innerPadding={4}
      // borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
      axisTop={null}
      axisRight={null}
      /* axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'responses',
            legendPosition: 'middle',
            legendOffset: 32
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'questions',
            legendPosition: 'middle',
            legendOffset: -40
        }} */
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
      legends={
        !showLegend
          ? undefined
          : [
              {
                dataFrom: 'keys',
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: 20,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20,
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemOpacity: 1
                    }
                  }
                ]
              }
            ]
      }
      animate={true}
      motionStiffness={90}
      motionDamping={15}
    />
  );
}

/*

          <Typography variant="body1">
            {r.proposition}
          </Typography>
          */
