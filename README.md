
# Byte

Byte is a discord bot designed to enhance your server with a variety of fun and useful [features](#Features). Below, you'll find an overview of what this bot can do.
## Features

- Have a chatbot using Gemini API with image and video support
- Change the color of a user using roles
- Have a levelling system working with the messages
- Welcomes new users
## Installation

Install Byte with git and the necessary packages using npm

```bash
  git clone https://github.com/NavosX/Byte.git .

  npm install discord.js dotenv mongoose canvacord @google/generative-ai request
```

Create a `src/config.json` file and fill it with the following:
```
{
    "colors": {
        "color role 1": "id",
        "color role 2": "id",
        "color role 3": "id",
        ...
    },
    "gemini": {
        "instructions": "(eg. Act like a human)",
        "instructionsResponce": "(eg. All instructions will be followed)"
    }
}
```
Create a `.env` file and fill it with the following:
```
TOKEN = Bot token
CHANNEL_ID = Bot-dedicated channel
CLIENT_ID = Bot ID
GUILD_ID = Guild (server) ID
WELCOME_ID = Welcome channel
MAIN_ID = Main channel
MEMBER_ID = Member role ID
MONGODB_URI = Mongo Database URI
GEMINI_TOKEN = Gemini token
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

- #### Chat with the AI:
To chat with the AI mention the bot or reply to one of his messages. You can also send images and videos.
- #### Changing the color:
Use `/color` and select the color role that you want.\
**Note:** You should configure your colors in `src/config.json` before using this command, otherwise it will not work.

- #### Leveling system:
Use `/level` to see your level, you can see someone's else level by filling in the next option.

- #### Help:
Use `?help` to see all the current features.\
Use `?media` to see AI-supported images and video.
## FAQ

#### How to chat with the AI?

Tag the bot or reply to one of his messages to start a conversation. The conversation restarts after 10 minutes of inactivity.

#### What AI model does the bot use?

The bot uses [Gemini 1.5 Pro](https://deepmind.google/technologies/gemini/pro/) to generate text-to-text and image/video-to-text messages.

#### What media types does the AI support?

[Gemini 1.5 Pro](https://deepmind.google/technologies/gemini/pro/) support these media types:\
Images: `png` `jpeg` `webp` `heic` `heif`\
Videos: `mp4` `mpeg` `mov` `avi` `x-flv` `mpg` `webm` `wmv` `3gpp`

#### How does the leveLling system work?

After you send a message, the bot connects to your Mongo database and writes an object containing the following attributes:
```
{
    "userId": user Id,
    "guildId": guild Id,
    "xp": total XP,
    "level": level,
}
```
Each message gives the user a random XP between 5 and 15, then the level is calculated using this formula `(level ÷ 0.25)² + 5`.

#### How does the welcome message work?

Once a user joins the server the bot selects a random color within the `config/colors.json` and assigns it with the member role to the user, then the bot send an embed to the welcome channel.
## Feedback & Support:

If you have any feedback or if you want support, please reach out to me at navosx.0@gmail.com
## Authors

- [@NavosX](https://www.github.com/NavosX)

