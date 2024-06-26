
# Byte

Byte is a discord bot designed to enhance your server with a variety of fun and useful [features](#Features). Below, you'll find an overview of what this bot can do.
## Features

- Change the color of a user using roles
- Have a leveling system working with the messages
- Welcomes any user
## Installation

Install Byte with git and the necessery packages using npm

```bash
  git clone https://github.com/NavosX/Byte.git .

  npm i discord.js

  npm i dotenv

  npm i mongoose

  npm i canvacord
```

After installing all the packages, configure the `src/data/colors.json` with your colored roles.\
Create a `.env` file and fill it with the following values.
```
TOKEN = your bot token
CLIENT_ID = your bot id
GUILD_ID = your guild(server) id
CHANNEL_ID = your channel dedicated to bots
WELCOME_ID = your channel dedicated to welcome messages
MAIN_ID = main channel (general)
MEMBER_ID = your member role id (optional)
MONGODB_URI = your mongoDB URI
```
## Deployment

To deploy this project run

```bash
node src/main.js
```

**Note:** Once you deploy your bot for the first time, you need to register the slash commands.

```bash
node src/utils/registerCommands.js
```

You can delete using the following command.

```bash
node src/utils/deleteCommands.js
```
## Documentation

- #### Changing the color:
Use `/color` and select the color role that you want.\
**Note:** You should configure you colors in `src/data/colors.json` before using this command, else it will not work.

- #### Leveling system:
Use `/level` to see your level, you see someone's else level by filling the next option.\
See how it work in the [FAQ](#How-does-the-leveling-system-work?) section.

- #### Help:
Send `?help` to see all the current features.
## FAQ

#### How does the coloring system work?

Once the user submited a valide `/color` command, the bot checks if the user already have a colored role, in case he does the bot removes it and then adds the color role tagged in the command option.

**Sources:** `src/events/commands/changeColor.js` `src/utils/addRole.js` `src/utils/removeRole.js`

#### How does the leveling system work?

After you send a message, the bot connects to your mongoDB and writes an object containing the following attributes:
```
{
    "_id": collection id,
    "userId": user Id,
    "guildId": guild Id,
    "xp": total xp,
    "level": level,
    "__v": versionKey
}
```
Each message gives the user a random xp between 5 and 15, then the level is calculated using this formula `(level ÷ 0.25)² + 5`.

**Sources:** `src/models/levelSchema.js` `src/events/messages/giveXp.js` `src/utils/calculateLevelXp.js`

#### How does the welcome message work?

Once a user joined the server the bot selects a random color within the `src/data/colors.json` and assign it with the member role to the user, then the bot send an embed to the welcome channel.

**Sources:** `src/events/welcome.js`

#### What colors can I use?

You can use any color you want, the important is that you configure the `src/data/colors.json` properly.\
However, I recommand using the discord Suggested colors:

![Suggested colors](https://i.postimg.cc/q7b5fJqn/colors.png)
## License

[GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html)\
[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://www.gnu.org/licenses/gpl-3.0.en.html)
## Feedback

If you have any feedback, please reach out to me at navosx.0@gmail.com
## Authors

- [@NavosX](https://www.github.com/NavosX)

