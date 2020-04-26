var AWS = require("aws-sdk");

var cloudFormation = new AWS.CloudFormation();

const deleteServer = (serverName, callback) => {
  var params = {
    StackName: serverName,
  };

  cloudFormation.deleteStacks(params, (err, data) => {
    if (err) throw err;
    callback();
  });
};

module.exports = {
  deleteServer,
};
