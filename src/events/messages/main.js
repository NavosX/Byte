const { channelMention } = require("discord.js");

const giveXp = require("./giveXp.js");
const chat = require("../../gemini/chat/main.js");

module.exports = (msg, channel, id) => {
  // Give XP to the user

  giveXp(msg);

  // Check if the message is for the bot

  if (msg.content == "?help" || msg.content == "?media") {
    // Decline if the message is not sent in the correct channel

    if (msg.channelId != channel) {
      msg.reply(
        "Please send commands in " + channelMention(channel) + " channel!"
      );
      return;
    }

    if (msg.content === "?help") {
      msg.reply(
        "Hello! I'm Byte. Here's what I can do:\n\n**Chat with AI:**\n- You can chat with me by tagging me <@" +
          id +
          "> or replying to my messages.\n\n**Commands:**\n- `/level`: See your/someone else level.\n- `/color`: Change your username color (Level 5+).\n\nChat with the AI for more info."
      );
    } else if (msg.content === "?media") {
      msg.reply(
        "Supported images and videos: `png` `jpeg` `webp` `heic` `heif` `mp4` `mpeg` `mov` `avi` `x-flv` `mpg` `webm` `wmv` `3gpp`"
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
