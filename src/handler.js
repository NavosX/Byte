module.exports = (client) => {
  const commands = require("./events/commands/main.js");
  const welcome = require("./events/welcome.js");
  const messages = require("./events/messages/main.js");

  // Fetch colors from a JSON file

  const colorsAndIds = require("./data/colors.json");
  const colors = Object.keys(colorsAndIds);
  const colorsId = Object.values(colorsAndIds);

  const botChannel = process.env["CHANNEL_ID"];

  // Commands interactions

  client.on("interactionCreate", (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    commands(interaction, botChannel, getRandomColor(), colorsId);
  });

  // Messages interactions

  client.on("messageCreate", (msg) => {
    // Declining bots

    if (msg.author.bot || !msg.inGuild()) return;

    messages(msg, botChannel);
  });

  // Welcome message

  client.on("guildMemberAdd", (member) => {
    // Declining bots

    if (member.user.bot) return;

    welcome(member, botChannel, getRandomColor(), colorsAndIds, colors);
  });

  // Functions

  function getRandomColor() {
    // Generate a random number between 0 and 255 for each color component

    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    // Convert the RGB values to a hexadecimal string

    const hex = `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

    return hex;
  }
};
