const { channelMention } = require("discord.js");

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
        msg.reply("🦄 Use `/color` to change you color\n⚡ Use `/level` to see your/someone's else level and xp");
      } else if (msg.content === "?media") {
        msg.reply("Supported images and videos: `png` `jpeg` `webp` `heic` `heif` `mp4` `mpeg` `mov` `avi` `x-flv` `mpg` `webm` `wmv` `3gpp`")
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
    // Check if the bot got tagged or replied

    if (
      msg.content.includes("@here") ||
      msg.content.includes("@everyone") ||
      msg.type == "REPLY"
    )
      return false;

    chat(msg, id);
  }
};
