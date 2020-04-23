const mc = require("minecraft-protocol");
const data = require("./data");

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

      if (playerCount !== 0) {
        console.log(`There are ${playerCount} player(s) online, do nothing!`);
        return;
      }

      const playerHistory = data.readPlayerHistory();

      if (shouldTerminate(playerHistory)) {
        terminateServer();
      }

      updatePlayerHistory(playerHistory, playerCount);
    }
  );
};

const shouldTerminate = (playerHistory) => {};

const terminateServer = () => {};

const updatePlayerHistory = (playerHistory, playerCount) => {};

module.exports = {
  handler,
};

handler();
