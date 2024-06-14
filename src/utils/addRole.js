module.exports = (member, role) => {
  // Adding the role to the user

  member.roles.add(role).catch((err) => {
    console.error(err);
    return;
  });
};
