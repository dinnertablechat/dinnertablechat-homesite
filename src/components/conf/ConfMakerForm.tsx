import { TextField, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Slide from '@material-ui/core/Slide';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useFormik } from 'formik';
import React, { useEffect, useState, useContext } from 'react';
import uuid from 'short-uuid';
import * as Yup from 'yup';
import * as AppModel from '../../models/AppModel';
import { ConfIdQuestion, ConfIdRow } from '../../services/ConfService';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {

    },
    form: {
      backgroundColor: '#ffffff',
      width: '550px',
      margin: '0 auto',
      borderRadius: '10px',
      padding: '0 0 30px 0'
      // padding: '0 10 0 0'
      // display: 'flex',
      // flexWrap: 'wrap'
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: '100%'
    },
    dense: {
      marginTop: 19
    },
    menu: {
      width: 200
    },
    err: {
      color: '#f24c4c',
      width: 200,
      margin: '-.6em auto 0 auto'
    },
    saved: {
      color: 'green',
    }
  })
);

interface Props {
  onClose: () => void;
  confid: string | null;
  data: ConfIdRow;
  user: string;
  onSubmit: (x: ConfIdRow) => void;
  onIdDel: (conf: string) => void;
}

interface State {
  saved: boolean;
  data?: ConfIdRow;
  last?: ConfIdRow;
  created: boolean;
}

export default (props: Props) => {
  const classes = useStyles({});
  const store = useContext(AppModel.Context)!;
  // const user = props.user;
  const confid = props.confid === 'new' ? '' : props.confid;
  if (props.data.conf === 'new') props.data.conf = '';

  const [state, setState] = useState<State>({ saved: false, created: false });

  const data = state.data || props.data;

  // make sure all input data has an id
  data.questions.forEach((x, i) => x.id = x.id || uuid.generate());

  // Set once the initial data
  const initialValues = React.useMemo(() => {
    const q = data.questions.reduce((acc, x, i) => {
      const _i = x.id;
      acc['question_' + _i] = x.question;
      acc['answer_' + _i] = x.answer;
      return acc;
    }, {});

    const d = { ...data, ...q };
    delete d.questions;

    if (confid) d.conf = confid;
    d.maxGroups = data.maxGroups || 10;

    d.minGroupUserPairs = (data.minGroupUserPairs || 1) * 2;
    // if(d.minGroupUserPairs < 2) d.minGroupUserPairs = 2; // overwrite default

    d.curl = data.curl || '';

    d.name = data.name || d.conf;

    return d;
  }, [props.data, props.data.questions]);

  // Clone for state
  useEffect(() => {
    // console.log('set state', props.data);
    const d: ConfIdRow = { ...props.data, questions: [...props.data.questions] };

    if (d.questions.length === 0) d.questions.push(newQuestions());

    setState(p => ({ ...p, data: d, created: !!d.updated }));
  }, [props.data, props.data.questions, props.data.ready]);

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: false,
    validationSchema: Yup.object({
      waitmsg: Yup.string().trim(),
      name: Yup.string().trim()
        .required('Required')
        .max(32, 'Must be between 3-32 characters to make the url short')
        .min(3, 'Must be between 3-32 characters to make the url short')
        .strict(false),
      conf: Yup.string().trim()
        .required('Required')
        .test(
          'is-word',
          '${path} must not contain spaces',
          (value: string) => value && value.indexOf(' ') === -1,
        )
        .matches(
          /^[a-z0-9_-]+$/,
          'allowed characters are lowcase letters, numbers, underscore and dash'
        )
        .max(7, 'Must be between 3-7 characters to make the url short')
        .min(3, 'Must be between 3-7 characters to make the url short')
        .lowercase('Must be lowercase').strict(true),
      minGroupUserPairs: Yup.number('must be a number')
        .min(2, 'Must be greater than or equal to 2')
        .max(60, 'Must be less than or equal to 60')
        .required('Number of users per group is required')
        .test(
          'is-even',
          'must be an even number of users',
          (value: number) => (value % 2) === 0,
        ),
      // maxGroups: Yup.number().min(1).max(500).required(),
      curl: Yup.string().url('${path} must be a valid url').notRequired().nullable(true)
    }),
    validateOnChange: true,
    onSubmit: async values => {

      let questions: any[] = [];
      try {
        questions = Object.keys(values)
          .filter(x => x.indexOf('question') === 0)
          .reduce((acc, k, i) => {

            const id = k.replace('question_', '');
            const vk = k.replace('question', 'answer');
            const question = values[k];

            // remove questions that where removed
            if (state.data!.questions.findIndex(y => id === y.id) === -1) return acc;

            const ans = values[vk] as string || 'Yes, No'; // must provide default here for default value

            if (!ans) {
              throw new Error('answer options cannot be blank');
            }

            if (!question) {
              throw new Error('question cannot be blank');
            }

            const validateAnswers = (ans: string) => {
              let valid = ans.indexOf(',') > -1;
              if (!valid) {
                throw new Error('answer options must have a comma')
              }

              const ansList = ans.replace(/,\s+/g, ',').split(',').filter(x => x !== '');
              // console.log('ansList', ansList);

              if (ansList.length < 2) {
                throw new Error('answer options must have at least two answers');
              }

              if (ansList.length > 3) {
                throw new Error('answer options cannot have more than 3 choices');
              }

              return ansList.join(', ');
            }
            const ansFormetted = validateAnswers(ans);
            if (!ansFormetted) throw new Error('invalid answer format');

            acc.push({
              id,
              question,
              answer: ansFormetted, // || 'Yes, No'
            });
            return acc;
          }, [] as any[]);
      } catch (e) {
        alert(e.message);
        return null;
      }

      // Filter out questions removed
      questions = questions.filter(q => !!q); // .filter(q => state.data!.questions.findIndex(y => q.id === y.id) > -1);

      console.log('questions data', questions);
      // return;

      const payload: ConfIdRow = {
        name: values.name,
        conf: values.conf,
        user: props.user,
        maxGroups: 100, // values.maxGroups, // hardcoded for now
        minGroupUserPairs: Math.floor(values.minGroupUserPairs / 2),
        questions,
        ready: props.data.ready,
        curl: values.curl,
        userPoolId: store.auth.user!.userPoolId!,
        version: props.data.version,
        updated: props.data.updated
      }

      if (values.waitmsg && values.waitmsg !== ' ') payload.waitmsg = values.waitmsg;

      if (!payload.userPoolId) throw new Error('no userPoolId');

      // console.log(values);
      console.log('payload', JSON.stringify(payload), values);
      // return;

      try {
        setState(p => ({ ...p, saved: true }));
        const isNew = !payload.updated;
        await props.onSubmit(payload);
        setState(p => ({ ...p, created: true }));
        if (isNew) props.onClose();
      } catch (e) {
        if (e.message.indexOf('aborted') > -1) {
          // do nothing
        } else {
          console.warn('error', e);
          alert('Save failed: ' + e.message);
        }
      } finally {
        setState(p => ({ ...p, saved: false }));
      }
    }
  });

  // url gen
  let url = window.location.origin + '/c/' + confid;
  if (store.isMixerProd()) url = 'https://mxop.at/' + confid; // window.location.origin + '/' + confid; // use root

  const visualURL = url.replace('http://', '').replace('https://', '');

  // window.location.href.replace(/(new\/)+edit/, formik.values['conf']).replace(/(\/)+edit/, '').toLowerCase();

  // const TF = wrap(formik).tf;
  const fields = [
    { name: 'name', label: 'The name of the event', type: 'input' },
    { name: 'conf', label: 'Short name for URL [3-7 lowercase letters or numbers]', type: 'input', short: true, disabled: !!confid },
    // { name: 'maxGroups', label: 'Max number of groups', type: 'input' },
    { name: 'curl', label: '[optional] 3rd-party shortener to above URL', type: 'input', adminOnly: true && !initialValues.curl },
    { name: 'minGroupUserPairs', label: 'Number of people in a group', type: 'input' },
    { name: 'waitmsg', label: '[optional] User waiting message', type: 'input' },
    { name: 'questions', type: 'array' }
  ].filter(x => !x.adminOnly || (!!x.adminOnly && store.auth.isAdmin()));

  const questionNodes = data.questions;
  // console.log('questionNodes', questionNodes, formik.values)

  const newQuestions = (): ConfIdQuestion => {
    return { 'question': '', answer: 'Yes, No', id: uuid.generate() };
  }

  const addQuestion = () => {
    if (!store.auth.isPaidUser() && state.data!.questions.length >= 4) {
      window.alert('Sorry, only paid users can add more than 4 questions. Please contact us at: team@newdialogue.org');
      window.open('mailto:team@newdialogue.org?subject=Upgrade request', '_blank');
      // indow.open('https://www.newdialogue.org', '_blank');
      return;
    }
    // const q = [...state.questions]; // Object.assign({}, state.questions);
    // q['question' + numQuestions] = '';
    // q['answer' + numQuestions] = 'Yes, No';
    state.data!.questions.push(newQuestions());
    console.log('state.data!.questions', JSON.stringify(state.data!.questions));
    // console.log('addQuestion', q)
    setState(p => ({ ...p, data: state.data }));
  }

  const onRemove = (index) => {
    // console.log('remove', index);
    const removeQ = state.data!.questions[index];

    const q = [...state.data!.questions];
    q.splice(index, 1);
    const d = { ...state.data!, questions: q };

    // formik.setFieldValue("", "");
    // formik.
    // delete q['question'+index];
    // delete q['answer'+index];

    // const questionNodes = Object.keys(state.questions).filter(x => x.indexOf("question") === 0);
    // let numQuestions = questionNodes.length;

    // console.log('q', q)
    setState(p => ({ ...p, data: d }));
  }

  return (
    <div className={classes.container}>

      <form
        className={classes.form}
        noValidate
        onSubmit={formik.handleSubmit}
      >
        {state.created && <div style={{ marginTop: '1em' }}>
          <Button onClick={(event) => {
            var win = window.open(url, '_blank');
            win!.focus();
            // Do save operation
          }} style={{ borderColor: 'green' }} variant="outlined">
            Questionnaire link
      </Button>
          <Button style={{ margin: '0 0 0 40px', borderColor: 'green' }} variant="outlined" onClick={(event) => {
            var win = window.open(url + '/admin', '_blank');
            win!.focus();
            // Do save operation
          }}>
            Presenter link
      </Button>
        </div>}
        {fields.map(x => {
          if (x.type === 'array') {
            return questionNodes.map((y, i: number) => (
              <Card key={'q' + y.id!} style={{ marginBottom: '1em' }}>
                <CardContent>
                  <Tf
                    multiline={true}
                    className={classes.textField}
                    id={`question_${y.id!}`}
                    label={'question'}
                    formik={formik}
                    data={y.question}
                  // data={state.questions[i].question}
                  />
                  <Tf
                    className={classes.textField}
                    id={`answer_${y.id!}`}
                    label={'answer options [comma seperated]'}
                    formik={formik}
                    // data={state.questions[i].answer}
                    // disabled={true}
                    data={y.answer}
                  />
                </CardContent>
                <CardActions>
                  <Typography variant="subtitle1" align="left" style={{ color: 'gray' }}>#{i + 1}</Typography><Button onClick={() => onRemove(i)} style={{ fontSize: '.5em' }} size="small">Remove Question</Button>
                </CardActions>
              </Card>
            ));
          }
          if (!x.name) return null;

          return (<span key={x.name}>
            <Tf className={classes.textField} id={x.name} label={x.label} formik={formik} disabled={x.disabled} />

            {x.name === 'conf' &&
              <Typography variant="subtitle1" align="right" style={{ color: 'gray', margin: '-0.7em 1em 1em 0' }}>public url: {visualURL} </Typography>
            }
          </span>
          );
        })}
        <div style={{ textAlign: 'right', width: '100%' }}><Button onClick={addQuestion}>Add Question</Button></div>

        <div style={{ marginTop: '1em' }}>
          <Button variant="contained" type="submit">
            Save
          </Button>
          <Button style={{ margin: '0 0 0 40px' }} variant="contained" onClick={(e) => { e.preventDefault(); props.onClose() }}>
            Return to list
          </Button>
          {state.created && <><br /><Button onClick={(event) => {
            const id = state.data!.conf;
            const ready = state.data!.ready;
            if (ready) {
              var r = window.alert('Delete an event that\'s already been active is not currently possible.');
              return;
            }
            props.onIdDel(id);
          }} style={{ margin: '20px 0 0 0' }} variant="text" color="secondary">
            Delete
          </Button></>}
        </div>
        {state.saved && <Typography
          gutterBottom={false}
          align="center"
          variant="subtitle1"
          className={classes.saved}
        >
          Saved
        </Typography>}
      </form>
      <br />

      <br />
      <br />
      <br />
    </div>
  );
};

function Tf({ id, formik, ...props }: any) {
  const classes = useStyles({});
  // const data = props.data;
  const multiline = props.multiline;

  // console.log('formik.getFieldProps(props.id)', props.id, formik.getFieldProps(props.id, 'input'))
  // if (props.id === 'curl') console.log('formik.values', formik.values);

  return (
    <span key={props.key || id}>
      <TextField
        style={{ width: '95%' }}
        margin="normal"
        id={id}
        // error={}
        label={props.label || id}
        variant="outlined"
        onChange={(e) => {
          const v = e.currentTarget.value;

          formik.handleChange(e);
        }}
        onBlur={formik.handleBlur}
        value={formik.values[id] !== undefined ? formik.values[id] : (props.data || '')} // || props.data}
        multiline={multiline}
        // {...formik.getFieldProps(id)}
        {...props}
      />
      {formik.touched[id] && formik.errors[id] ? (
        <Typography
          gutterBottom={false}
          align="center"
          variant="subtitle1"
          className={classes.err}
          style={{ width: '100%' }}
        >
          ↳ {formik.errors[id]}
        </Typography>
      ) : (
          <br />
        )}
    </span>
  );
}
