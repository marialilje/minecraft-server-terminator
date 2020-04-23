const mc = require("minecraft-protocol");

exports.handler = function () {
  mc.ping(
    {
      host: "minecraft.matt-cole.co.uk",
    },
    (error, data) => {
      console.log("pinged", data, error);
      if (error !== null) {
        if (error.code === "ENOTFOUND") {
          console.log("Server is off, do nothing");
          return;
        }
        throw new Error(`Server ping failed with error code ${error.code}`);
      }
      if (data.players.online !== 0) {
        console.log(
          `There are ${data.players.online} player(s) online, do nothing!`
        );
        return;
      }
      setTimeout(() => {
        console.log("Continuing now");
        mc.ping(
          {
            host: "minecraft.matt-cole.co.uk",
          },
          (error, data) => {
            console.log("pinged again", data);
            if (error !== null) {
              if (error.code === "ENOTFOUND") {
                console.log("Server is off, do nothing");
                return;
              }
              throw new Error(
                `Server ping failed with error code ${error.code}`
              );
            }
          }
        );
      }, 1500);
    }
  );
  console.log("done");
};

exports.handler();
