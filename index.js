const mc = require("minecraft-protocol");
const db = require("./data");
const cf = require("./server");

const host = process.env.HOST;
const stackName = process.env.STACK_NAME;

if (!host) throw Error("HOST environment variable is required");
if (!stackName) throw Error("STACK_NAME environment variable is required");

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
        console.log(`There are ${playerCount} player(s), exiting`);
        return;
      }

      if (shouldTerminate(serverLog)) {
        console.log("Shutting down server based on log:", serverLog);

        cf.deleteStack(stackName, () => {
          console.log(`Successfully deleted stack ${stackName}`);
        });
      } else {
        console.log("Not shutting down server based on log:", serverLog);
      }
    });
  });
};

const shouldTerminate = (serverLog) => {
  return !serverLog.playerHistory.some(
    (playerHistoryEntry) => playerHistoryEntry.playerCount > 0
  );
};

const updateServerLog = (serverLog, playerCount) => {
  const newPlayerHistory = serverLog.playerHistory.filter((log) =>
    isWithinHour(log.timestamp)
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

const isWithinHour = (timestamp) => {
  const timestampAsDate = new Date(timestamp);
  const oneHour = 60 * 60 * 1000;

  return new Date() - timestampAsDate < oneHour;
};

module.exports = {
  handler,
};

handler();
