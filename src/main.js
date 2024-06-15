require("dotenv").config();
const { Client, IntentsBitField } = require("discord.js");
const mongoose = require("mongoose");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
    
  ],
});

const ready = require("./events/ready.js");

// Connecting to the database

(async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env["MONGODB_URI"]);
    console.log("Connected to DB.");

    // Sanity check

    ready(client);

    // Bot login

    client.login(process.env["TOKEN"]);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();
