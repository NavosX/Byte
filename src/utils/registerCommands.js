require("dotenv").config();
const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");

const commands = [
  {
    name: "color",
    description: "Change the color of your username.",
    options: [
      {
        name: "color",
        description: "Choose the color you want.",
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
    ],
  },
  {
    name: "level",
    description: "See your/someone's else level.",
    options: [
      {
        name: "user",
        description: "Select the user whose level you want to see.",
        type: ApplicationCommandOptionType.User,
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(process.env["TOKEN"]);

(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env["CLIENT_ID"],
        process.env["GUILD_ID"]
      ),
      { body: commands }
    );

    console.log("Slash commands were registered successfully!");
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();
