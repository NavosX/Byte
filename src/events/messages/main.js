const { channelMention } = require("discord.js");

const help = require("./help.js");
const giveXp = require("./giveXp.js");
const chat = require("../../gemini/chat/main.js");

module.exports = (msg, channel, id) => {
  // Give XP to the user

  giveXp(msg);

  // Check if the message is for the bot

  if (msg.content.startsWith("?")) {
    if (msg.channelId === channel) {
      // Send help
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
  } else if (msg.mentions.has(id)) {

    if (msg.content.includes("@here") || msg.content.includes("@everyone") || msg.type == "REPLY") return false;

    chat(msg, id)
    
  }
};
