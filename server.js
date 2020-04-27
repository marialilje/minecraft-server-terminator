var AWS = require("aws-sdk");

var cloudFormation = new AWS.CloudFormation();

const deleteStack = (stackName, callback) => {
  var params = {
    StackName: stackName,
  };

  cloudFormation.deleteStack(params, (err) => {
    if (err) throw err;
    callback();
  });
};

module.exports = {
  deleteStack,
};
