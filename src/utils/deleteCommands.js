require("dotenv").config();
const { REST, Routes } = require('discord.js');

const rest = new REST().setToken(process.env["TOKEN"]);


rest.put(Routes.applicationGuildCommands(process.env["CLIENT_ID"], process.env["GUILD_ID"]), { body: [] })
	.then(() => console.log('Successfully all guild command.'))
	.catch(err => console.error(err));