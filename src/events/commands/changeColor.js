const { EmbedBuilder } = require("discord.js");

const addRole = require("../../utils/addRole.js");
const removeRole = require("../../utils/removeRole.js");

module.exports = (interaction, embedColor, colorsId) => {
  const { options, member } = interaction;
  const color = options.getRole("color");
  const colorId = color.id;

  // Checking if the role is a color

  if (colorsId.includes(colorId)) {
    colorsId.forEach((id) => {
      if (member.roles.cache.some((role) => role.id === id)) {
        // Removing the color role
        removeRole(member, id);
      }
    });

    // Adding the color role

    addRole(member, colorId);

    // Response Message

    interaction.editReply(
      `<@${member.id}> your color changed successfully to <@&${colorId}> !`
    );
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
