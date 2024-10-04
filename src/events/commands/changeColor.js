const { EmbedBuilder } = require("discord.js");

const addRole = require("../../utils/addRole.js");
const removeRole = require("../../utils/removeRole.js");
const fetchLevel = require("../../utils/fetchDB.js");

module.exports = (interaction, embedColor, colorsId) => {
  const { options, member } = interaction;
  const color = options.getRole("color");
  const colorId = color.id;
  const minLevel = 5;

  // Checking if the role is a color

  if (colorsId.includes(colorId)) {
    // Checking if the user have minimum level required to change color

    fetchLevel(member.id, interaction.guild.id, function (data) {
      if (data[0].level >= minLevel) {
        // Removing the color role
        colorsId.forEach((id) => {
          if (member.roles.cache.some((role) => role.id === id)) {
            removeRole(member, id);
          }
        });
        // Adding the color role

        addRole(member, colorId);

        // Response Message

        interaction.editReply(
          `<@${member.id}> your color changed successfully to <@&${colorId}> !`
        );
      } else if (data[0].level <= minLevel) {
        // Response Message
        interaction.editReply(
          `<@${member.id}> you can change color once you reach **level 5**!`
        );
      } else {
        // Error Message
        interaction.editReply(
          `An error has happend, please contact the developer for help.`
        );
      }
    });
  }

  // Returning an error if the role isn't a color
  else {
    const mention = colorMention(colorsId);

    // Embed creation

    const errorEmbed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle("Error 406")
      .setAuthor({ name: "Byte" })
      .setDescription("Error 406: Not Acceptable")
      .addFields({ name: "Please choose one of these colors!", value: mention })
      .setTimestamp()
      .setFooter({ text: "Use `?help` for help" });

    // Responce Embed

    interaction.editReply({ embeds: [errorEmbed] });
  }
};

// Functions

function colorMention(id) {
  var response = "";

  // Building the responce

  id.forEach((id) => {
    response = response + `<@&${id}>\n\n`;
  });

  return response;
}
