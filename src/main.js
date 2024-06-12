require('dotenv').config();
const fs = require('fs');
const { Client, IntentsBitField, channelMention, SlashCommandBuilder, EmbedBuilder, roleMention } = require("discord.js");


const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ],
});


// Fetch colors from a JSON file


const colorAndId = JSON.parse(fs.readFileSync('src/data/colors.json', 'utf8'));
const colors = Object.keys(colorAndId);
const colorId = Object.values(colorAndId);


// Sanity checking && Commands creation


client.on("ready", () => {

    const commands = new SlashCommandBuilder()
    .setName("color")
    .setDescription("Change the color of your username!")
    .addRoleOption(option => option.setName("color").setDescription("Please choose the role in which the color you want.").setRequired(true));

    client.application.commands.create(commands);


    console.log("Bot Online!");

});


// Commands interactions


client.on('interactionCreate', (i) => {

    if (!i.isChatInputCommand()) return;

    // Channel check

    if (i.channelId === process.env['CHANNEL_ID']) {

        // Color role exchange

        if (i.commandName === "color") {

            const { options, member } = i;
            const color = options.getRole("color");

            // Checking if the role is a color

            if (colors.includes(color.name)) {

                // Removing the color role if it is currently assigned to the user

                let colorRemoved = false;

                colors.forEach( (colorName) => {

                    if (!colorRemoved) {         // If the 'colors' object is very large, this is an attempt to expedite the process (It can be omitted)

                        if (member.roles.cache.some(role => role.name === colorName)) {

                            const id = colorAndId[colorName];
    
                            member.roles.remove(id).catch(err => {
                                console.error(err);
                                return;
                            });

                        };

                    };
                    
                });

                // Adding the color Role

                member.roles.add(color).catch(err => {
                    console.error(err);
                    return;
                });

                // Response Message

                i.reply("Color changed successfully!");

            }
            
            // Returning an error if the role isn't a color

            else {

                const mention = colorMention(colorId);

                // Embed creation

                const errorEmbed = new EmbedBuilder()
                    .setColor(getRandomColor())
                    .setTitle('Error 406')
                    .setAuthor({ name: 'Byte' })
                    .setDescription('Error 406: Not Acceptable')
                    .addFields(
                        { name: 'Please choose one of these colors!', value: mention }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Use `?help` for help'});

                // Responce Embed

                i.reply({ embeds: [errorEmbed] });

            };

        };

    }

    // Decline command in wrong channel
    
    else {
        i.reply("Command declined! \n Please send commands in " + channelMention(process.env['CHANNEL_ID']) + "!");
    };

});


// Messages interactions


client.on("messageCreate", (msg) => {

    // Declining bots

    if (msg.author.bot) return;

    // Check message content

    if (msg.content === "?help") {

        // Channel check

        if (msg.channelId === process.env['CHANNEL_ID']) {
            msg.reply("Do you want to change colors? Use `/color` and fill the command!" );
        }

        // Decline command in wrong channel
        
        else {
            msg.reply("Command declined! \n Please send commands in " + channelMention(process.env['CHANNEL_ID']) + "!");
        };

    };

});


// Bot login


client.login(process.env['TOKEN']);


// Functions


function getRandomColor() {

    // Generate a random number between 0 and 255 for each color component

    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
  
    // Convert the RGB values to a hexadecimal string

    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  
    return hex;

};

function colorMention(id) {

    var response;

    // Building the responce

    id.forEach((id) => {
        response = response + `<@&${id}>\n\n`;
    })

    return response;

};