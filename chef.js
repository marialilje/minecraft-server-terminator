const ChefApi = require("chef-api");

const chef = new ChefApi();
chef.config({
  url: process.env.CHEF_SERVER_URL,
  client_name: process.env.CHEF_CLIENT_NAME,
  key: process.env.CHEF_CLIENT_KEY,
});

const cleanupChef = (nodeName, callback) => {
  deleteNode(nodeName, (err) => {
    if (err) throw err;
    deleteClient(nodeName, (err) => {
      if (err) throw err;
      callback();
    });
  });
};

const deleteNode = (nodeName, callback) => {
  chef.deleteNode(nodeName, (err) => {
    var notFoundMessage = `Received status code: 404 - node '${nodeName}' not found`;
    return err && err.message !== notFoundMessage ? callback(err) : callback();
  });
};

const deleteClient = (nodeName, callback) => {
  chef.deleteClient(nodeName, (err) => {
    var notFoundMessage = `Received status code: 404 - Cannot load client ${nodeName}`;
    return err && err.message !== notFoundMessage ? callback(err) : callback();
  });
};

module.exports = {
  cleanupChef,
};
