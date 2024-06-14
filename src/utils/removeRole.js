module.exports = (member, role) => {
  // Removing the role to the user

  member.roles.remove(role).catch((err) => {
    console.error(err);
    return;
  });
};
