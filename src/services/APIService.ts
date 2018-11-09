import API from '@aws-amplify/api';

async function getScores() {
  let apiName = 'history';
  let path = '/hello';
  let myInit = {
    // OPTIONAL
    headers: {}, // OPTIONAL
    response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
    queryStringParameters: {
      // OPTIONAL
      name: 'param'
    }
  };
  return API.get(apiName, path, myInit)
    .then(response => {
      // Add your code here
      return response;
    })
    .catch(error => {
      console.log(error.response);
    });
}

export default { getScores };
