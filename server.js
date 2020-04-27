var AWS = require("aws-sdk");

var cloudFormation = new AWS.CloudFormation();

const deleteStack = (stackName, callback) => {
  var params = {
    StackName: stackName,
  };

  cloudFormation.deleteStacks(params, (err) => {
    if (err) throw err;
    callback();
  });
};

module.exports = {
  deleteStack,
};
