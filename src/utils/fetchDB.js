const levelSchema = require("../models/levelSchema.js");

module.exports = async (userId, guildId, callback) => {
  // Fetch the user data

  const fetchedLevel = await levelSchema.findOne({
    userId: userId,
    guildId: guildId,
  });

  // Return if the user don't have any data

  if (!fetchedLevel) {
    callback([{ userId: userId, xp: 0, level: 0 }]);
    return;
  }

  // Fetch the user data

  let data = await levelSchema
    .find({ guildId: guildId, userId: userId })
    .select("-_id userId level xp");

  callback(data);
};
