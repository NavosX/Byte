const { Font, RankCardBuilder } = require("canvacord");
const calculateLevelXp = require("../../utils/calculateLevelXp.js");
const levelSchema = require("../../models/levelSchema.js");
const { AttachmentBuilder } = require("discord.js");

module.exports = async (interaction) => {
  // Keep the command alive

  await interaction.deferReply();

  // Get the command parameters

  const mentionedUserId = interaction.options.get("user")?.value;
  const UserId = mentionedUserId || interaction.member.id;
  const UserObj = await interaction.guild.members.fetch(UserId);

  // Reject bots

  if (UserObj.user.bot) {
    interaction.editReply("Please select a user not a bot.");
    return;
  }

  // Fetch the user level

  const fetchedLevel = await levelSchema.findOne({
    userId: UserId,
    guildId: interaction.guild.id,
  });

  // Return if the user don't have any levels

  if (!fetchedLevel) {
    interaction.editReply(
      mentionedUserId
        ? `**${UserObj.user.globalName}** does not have any levels nor xp.`
        : "You don't have any levels nor xp."
    );
    return;
  }

  // Fetch all levels

  let allLevels = await levelSchema
    .find({ guildId: interaction.guild.id })
    .select("-_id userId level xp");

  // Sort levels

  allLevels.sort((a, b) => {
    if (a.level === b.level) {
      return b.xp - a.xp;
    } else {
      return b.level - a.level;
    }
  });

  // Set rank

  let currentRank = allLevels.findIndex((lvl) => lvl.userId === UserId) + 1;

  // Calculate the required and current XP

  const currentLevelXp = calculateLevelXp(fetchedLevel.level);
  const previousLevelXp = calculateLevelXp(fetchedLevel.level - 1);
  const requiredXp = currentLevelXp - previousLevelXp;
  const currentXp = fetchedLevel.xp - previousLevelXp;

  // Load Canvacord default font

  Font.loadDefault();

  // Create a rank card

  const rank = new RankCardBuilder()
    .setAvatar(UserObj.displayAvatarURL({ size: 256 }))
    .setRank(currentRank)
    .setLevel(fetchedLevel.level)
    .setCurrentXP(currentXp)
    .setRequiredXP(requiredXp)
    .setStatus(UserObj.presence?.status)
    .setDisplayName(UserObj.user.globalName)
    .setUsername("@" + UserObj.user.tag);

  // Build the image

  const data = await rank.build();

  // Send the image

  const attachment = new AttachmentBuilder(data);
  interaction.editReply({ files: [attachment] });
};
