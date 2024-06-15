const { channelMention } = require("discord.js");

const changeColor = require("./changeColor.js");
const inspectLevel = require("./inspectLevel.js");

module.exports = (interaction, channel, embedColor, colorsId) => {
  if (interaction.channelId === channel) {
    // Color role exchange

    if (interaction.commandName === "color") {
      changeColor(interaction, embedColor, colorsId);
    } else if (interaction.commandName === "level") {
      inspectLevel(interaction);
    }
  }

  // Decline command in wrong channel
  else {
    interaction.reply(
      "❌ Command declined! \n📨 Please send commands in " +
        channelMention(channel) +
        " channel!"
    );
  }
};
