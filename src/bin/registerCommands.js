module.exports = (client) => {
  const commands = new SlashCommandBuilder()
    .setName("color")
    .setDescription("Change the color of your username!")
    .addRoleOption((option) =>
      option
        .setName("color")
        .setDescription("Please choose the role in which the color you want.")
        .setRequired(true)
    );

  client.application.commands.create(commands);
};
