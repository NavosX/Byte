const { channelMention, EmbedBuilder } = require("discord.js");

const addRole = require("./utilities/addRole");

const botId = process.env["BOT_ID"];
const welcomeChannel = process.env["WELCOME_ID"];
const mainChannel = process.env["MAIN_ID"];
const memberRole = process.env["MEMBER_ID"];

module.exports = (member, botChannel, embedColor, colorsAndIds, colors) => {
  const guildName = member.guild.name;
  const memberName = member.user.globalName;
  const memberId = member.user.id;
  const ruleChannel = member.guild.rulesChannelId;
  const channel = member.guild.channels.cache.get(welcomeChannel);
  const randomColorId =
    colorsAndIds[colors[(colors.length * Math.random()) << 0]];

  // Embed creation

  const welcomeEmbed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(memberName)
    .setDescription(
      `📣  Welcome 👋 <@${memberId}> to **${guildName}** we hope you enjoy your stay.\n
                        📜  Check out the ${channelMention(
                          ruleChannel
                        )} channel to ensure you keep the server a fun and welcoming space for everyone!\n
                        🤖  Use ${"`?help`"} in ${channelMention(
        botChannel
      )} to know everything about <@${botId}> our bot.\n
                        🗣️  Say hello and talk with members in the ${channelMention(
                          mainChannel
                        )} chat.\n
                        ✨  You were given the <@&${randomColorId}> color, you can change it by using the ${"`/color`"} command.`
    )
    .setImage("https://i.ibb.co/hckJwVX/welcome.png");

  // Send embed

  channel.send({ embeds: [welcomeEmbed] });

  // Give necessary roles and a random color

  addRole(member, [randomColorId, memberRole]);
};
