const calculateLevelXp = require("../../utils/calculateLevelXp.js");
const levelSchema = require("../../models/levelSchema.js");
const cooldowns = new Set();
const cooldownTime = 800;

module.exports = async (msg) => {
  // Reject spam
  if (cooldowns.has(msg.author.id)) return;

  // Get random XP from 5 to 15

  const xp = getRandomXp(5, 15);

  // User data

  const query = {
    userId: msg.author.id,
    guildId: msg.guild.id,
  };

  try {
    const level = await levelSchema.findOne(query);

    // Add XP level

    if (level) {
      level.xp += xp;

      if (level.xp > calculateLevelXp(level.level)) {
        // Set new level

        level.level += 1;

        // Send message

        msg.channel.send(
          `Congratulations ${msg.member} you have leveled up to **level ${level.level}**.`
        );
      }

      // Save the new data to the cloud

      await level.save().catch((err) => {
        console.error(`Error saving updated level ${err}`);
        return;
      });

      // Set cooldown

      cooldowns.add(msg.author.id);
      setTimeout(() => {
        cooldowns.delete(msg.author.id);
      }, cooldownTime);
    } else {
      // Create a new query in the database

      const newLevel = new levelSchema({
        userId: msg.author.id,
        guildId: msg.guild.id,
        xp: xp,
        level: 1,
      });

      msg.channel.send(
        `Congratulations ${msg.member} you have leveled up to **level 1**.`
      );

      // Save the new data to the cloud

      await newLevel.save();
      cooldowns.add(msg.author.id);

      // Set cooldown
      setTimeout(() => {
        cooldowns.delete(msg.author.id);
      }, cooldownTime);
    }
  } catch (err) {
    console.error(`Error giving xp: ${err}`);
  }
};

function getRandomXp(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
