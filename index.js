require("dotenv").config();

[
  "HOST",
  "STACK_NAME",
  "CHEF_SERVER_URL",
  "CHEF_CLIENT_NAME",
  "CHEF_CLIENT_KEY",
].forEach((variableName) => {
  if (!process.env[variableName])
    throw new Error(`${variableName} environment variable is required`);
});

const mc = require("minecraft-protocol");
const db = require("./data");
const cf = require("./server");
const chef = require("./chef");

const host = process.env.HOST;
const stackName = process.env.STACK_NAME;
const maxInactiveMins = 60;
const minRunningMins = 30;

const handler = () => {
  mc.ping({ host }, (error, data) => {
    if (error !== null) {
      if (error.code === "ENOTFOUND") {
        console.log("Server is not running, exiting");
        return;
      }
      throw new Error(`Server ping failed with error code ${error.code}`);
    }

    const playerCount = data.players.online;

    db.readServerLog(host, (serverLog) => {
      const newServerLog = updateServerLog(serverLog, playerCount);

      db.writeServerLog(newServerLog, () => {
        console.log("Successfully updated server log");
      });

      if (playerCount !== 0) {
        console.log(`There are ${playerCount} player(s) online, exiting`);
        return;
      }

      if (shouldTerminate(newServerLog)) {
        console.log("Shutting down server based on log:", newServerLog);

        cf.deleteStack(stackName, () => {
          console.log(`Successfully deleted stack ${stackName}`);
        });

        chef.cleanupChef(stackName, () => {
          console.log(`Successfully cleaned up Chef`);
        });
      } else {
        console.log("Not shutting down server based on log:", newServerLog);
      }
    });
  });
};

const shouldTerminate = (serverLog) => {
  const serverRunningForMinRunningTime =
    minutesSinceTimestamp(serverLog.playerHistory[0].timestamp) >
    minRunningMins;

  const serverInactive = !serverLog.playerHistory.some(
    (playerHistoryEntry) => playerHistoryEntry.playerCount > 0
  );

  return serverRunningForMinRunningTime && serverInactive;
};

const updateServerLog = (serverLog, playerCount) => {
  const newPlayerHistory = serverLog.playerHistory.filter(
    (log) => minutesSinceTimestamp(log.timestamp) < maxInactiveMins
  );

  const playerHistoryEntry = {
    playerCount: playerCount,
    timestamp: new Date().toISOString(),
  };

  newPlayerHistory.push(playerHistoryEntry);

  return {
    server: serverLog.server,
    playerHistory: newPlayerHistory,
  };
};

const minutesSinceTimestamp = (timestamp) => {
  var diff = new Date() - new Date(timestamp);
  return Math.round(diff / (1000 * 60));
};

module.exports = {
  handler,
};
