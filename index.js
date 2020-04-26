const mc = require("minecraft-protocol");
const db = require("./data");
const cf = require("./server");

const handler = () => {
  mc.ping(
    {
      host: "minecraft.matt-cole.co.uk",
    },
    (error, data) => {
      if (error !== null) {
        if (error.code === "ENOTFOUND") {
          console.log(
            "You have encountered a snoozy server, shhhh! Don't wake it!"
          );
          return;
        }
        throw new Error(`Server ping failed with error code ${error.code}`);
      }

      const playerCount = data.players.online;

      db.readServerLog((serverLog) => {
        const newServerLog = updateServerLog(serverLog, playerCount);

        console.log("OLD", serverLog);
        console.log("NEW", newServerLog);

        db.writeServerLog(newServerLog, () => {
          console.log("successfully updated player histroy!");
        });

        if (shouldTerminate(serverLog, playerCount)) {
          cf.deleteServer("minecraft-2020", () => {
            console.log("sucessfully deleted the server!");
          });
        }
      });
    }
  );
};

const shouldTerminate = (serverLog, playerCount) => {
  if (playerCount !== 0) {
    console.log(`There are ${playerCount} player(s) online, do nothing!`);
    return false;
  }

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
