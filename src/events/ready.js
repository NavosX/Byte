const handler = require("../handler.js");

module.exports = (client) => {
  client.on("ready", () => {
    console.log("Bot Online!");

    // Event interactions

    handler(client);
  });
};
