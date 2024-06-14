require("dotenv").config();
const { Client, IntentsBitField, channelMention } = require("discord.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const interactions = require("./interactions/main.js");
const welcome = require("./welcome.js");
const messages = require("./messages/main.js");

// Fetch colors from a JSON file

const colorsAndIds = require("./data/colors.json");
const colors = Object.keys(colorsAndIds);
const colorsId = Object.values(colorsAndIds);

const botChannel = process.env["CHANNEL_ID"];

client.on("ready", () => {
  // Sanity checking

  console.log("Bot Online!");
});

// Commands interactions

client.on("interactionCreate", (i) => {
  if (!i.isChatInputCommand()) return;

  // Channel check

  interactions(i, botChannel, getRandomColor(), colorsId);
});

// Messages interactions

client.on("messageCreate", (msg) => {
  // Declining bots

  if (msg.author.bot) return;

  // Check message content

  messages(msg, botChannel);
});

// Welcome message

client.on("guildMemberAdd", (member) => {
  // Declining bots

  if (member.user.bot) return;

  welcome(member, botChannel, getRandomColor(), colorsAndIds, colors);
});

// Bot login

client.login(process.env["TOKEN"]);

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
