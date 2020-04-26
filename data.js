var AWS = require("aws-sdk");

AWS.config.update({ region: "eu-west-1" });

var docClient = new AWS.DynamoDB.DocumentClient();

const readServerLog = (callback) => {
  var params = {
    TableName: "minecraft-player-history",
    Key: { server: "minecraft.matt-cole.co.uk" },
  };

  docClient.get(params, (err, data) => {
    if (err) throw err;
    callback(data.Item);
  });
};

const writeServerLog = (serverLog, callback) => {
  var params = {
    TableName: "minecraft-player-history",
    Item: serverLog,
  };

  docClient.put(params, function (err) {
    if (err) throw err;
    callback();
  });
};

module.exports = {
  readServerLog: readServerLog,
  writeServerLog: writeServerLog,
};
