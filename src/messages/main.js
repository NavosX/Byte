const { channelMention } = require("discord.js");

const help = require("./help.js");

module.exports = (msg, channel) => {
  if (msg.channelId === channel) {
    if (msg.content === "?help") {
      help(msg);
    }
  }

  // Decline command in wrong channel
  else {
    msg.reply(
      "❌ Command declined! \n📨 Please send commands in " +
        channelMention(channel) +
        " channel!"
    );
  }
};