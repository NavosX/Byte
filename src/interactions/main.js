const { channelMention } = require("discord.js");

const changeColor = require("./changeColor.js");

module.exports = (interaction, channel, embedColor, colorsId) => {
  if (interaction.channelId === channel) {
    // Color role exchange

    if (interaction.commandName === "color") {
      changeColor(interaction, embedColor, colorsId);
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
