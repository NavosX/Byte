require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const configuration = require("../../config.json");

// Creating the Gemini model

const genAI = new GoogleGenerativeAI(process.env["GEMINI_TOKEN"]);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

let isNewChat = true;
let chat, time;

// Timeout variables

const maxUserTimeout = 300000;
const chatTimeout = 480000;
let userTimeouts = {};
const defaultTimeout = 3000;
const globalTimeout = 2000;
let lastResponce = 0;

// Supported media types

const mediaTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/mpeg",
  "video/mov",
  "video/avi",
  "video/x-flv",
  "video/mpg",
  "video/webm",
  "video/wmv",
  "video/3gpp",
];

module.exports = async (msg, id) => {
  // Removing the tag from the message

  const content = msg.content.replace(`<@${id}> `, "");

  // Check if the message have attachments

  if (msg.attachments.size > 0) {
    if (!isNewChat && spamTimeout(msg)) return;

    // Check if the attachment contain supported image(s)/video(s)

    isMedia = false;

    msg.attachments.forEach((attachment) => {
      if (mediaTypes.includes(attachment.contentType)) {
        isMedia = true;
      }
    });

    if (isMedia) {
      let mediaParts = [];

      let index = 1;
      var unsupported = 0;

      msg.attachments.forEach((attachment) => {
        // Removing unsupported file(s)

        if (!mediaTypes.includes(attachment.contentType)) {
          index++;
          unsupported++;
          return;
        }

        // Fetch the image/video

        var request = require("request").defaults({ encoding: null });

        let media;

        request.get(attachment.url, async function (error, res, body) {
          if (!error && res.statusCode == 200) {
            // Convert the image/video to base64

            media = Buffer.from(body).toString("base64");
            var mimeType = attachment.contentType;

            mediaParts.push({
              inlineData: {
                data: media,
                mimeType,
              },
            });

            // Check if all the attachments have been processed

            if (msg.attachments.size === index) {
              // Generate the model responce

              const generatedContent = await model.generateContent([
                content,
                ...mediaParts,
              ]);

              var rawText = generatedContent.response.text();

              // Responding to the message & adding it to the conversation history

              const splitedText = splitText(rawText);

              let part = 1;

              splitedText.forEach((text) => {
                if (splitedText.length == 1) {
                  msg.reply(text);
                } else {
                  const response = `**Part ${part}:**\n\n` + text;
                  if (part == 1) {
                    msg.reply(
                      unsupported > 0
                        ? `There exist **${unsupported} unsupported file(s)** among these medias, ` +
                            "type `?media` for more info.\n\n" +
                            response
                        : response
                    );
                  } else {
                    msg.reply(response);
                  }
                  part++;
                }
              });

              addChat(content, rawText, msg);
            } else {
              index++;
            }
          } else {
            // Error fetching the media

            var response =
              "Sorry, but there was an error fetching the URL. \n\n More Info: \n **Status Code:** `" +
              res.statusCode +
              "`";

            msg.reply(response);

            addChat(content, response, msg);
          }
        });
      });
    } else {
      // Respond if no attachment is supported & adding it to the conversation history

      if (msg.attachments.size == 1) {
        var response =
          "Sorry, but `" +
          msg.attachments.first().contentType +
          "` file type **is not supported**, type `?media` for more info.";

        msg.reply(response);

        addChat(content, response, msg);
      } else if (msg.attachments.size > 1) {
        let attachmentsType = "";

        msg.attachments.forEach((attachment) => {
          var type = "`" + attachment.contentType + "` ";

          if (!attachmentsType.includes(type)) {
            attachmentsType += type;
          }
        });

        var response =
          "Sorry, but " +
          attachmentsType +
          "file types **are not supported**, type `?media` for more info.";

        msg.reply(response);

        addChat(content, response, msg);
      }
    }
  }

  // Check if it's a new chat or the timeout have finished
  else if (isNewChat) {
    // Set a timeout to restart a new conversation

    time = setTimeout(function () {
      isNewChat = true;
      userTimeouts = {};
    }, chatTimeout);

    spamTimeout(msg);

    // Create a new chat with instructions

    chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: configuration.gemini.instructions }],
        },
        {
          role: "model",
          parts: [{ text: configuration.gemini.instructionsResponce }],
        },
      ],
    });

    isNewChat = false;

    // Responding to the message

    const response = await chat.sendMessage(content);
    const text = response.response.text();

    const splitedText = splitText(text);

    let part = 1;

    splitedText.forEach((text) => {
      if (splitedText.length == 1) {
        msg.reply(text);
      } else {
        msg.reply(`**Part ${part}:**\n\n` + text);
        part++;
      }
    });
  }

  // There is already a conversation
  else {
    // Reset the timeout

    clearTimeout(time);

    time = setTimeout(function () {
      isNewChat = true;
      userTimeouts = {};
    }, chatTimeout);

    if (spamTimeout(msg)) return;

    // Responding to the message

    const response = await chat.sendMessage(content);
    const text = response.response.text();

    const splitedText = splitText(text);

    let part = 1;

    splitedText.forEach((text) => {
      if (splitedText.length == 1) {
        msg.reply(text);
      } else {
        msg.reply(`**Part ${part}:**\n\n` + text);
        part++;
      }
    });
  }
};

// A function to add messages to the conversation history

function addChat(userText, modelText, msg) {
  // Check if there is already a conversation

  if (chat) {
    // Reset the timeout

    clearTimeout(time);

    time = setTimeout(function () {
      isNewChat = true;
      userTimeouts = {};
    }, chatTimeout);

    spamTimeout(msg);

    // Push the new messages

    chat.params.history.push(
      {
        role: "user",
        parts: [{ text: userText }],
      },
      {
        role: "model",
        parts: [{ text: modelText }],
      }
    );
  } else {
    // Start the timeout

    time = setTimeout(function () {
      isNewChat = true;
      userTimeouts = {};
    }, chatTimeout);

    spamTimeout(msg);

    isNewChat = false;

    // Push the new message along with the instructions

    chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: configuration.gemini.instructions }],
        },
        {
          role: "model",
          parts: [{ text: configuration.gemini.instructionsResponce }],
        },
        {
          role: "user",
          parts: [{ text: userText }],
        },
        {
          role: "model",
          parts: [{ text: modelText }],
        },
      ],
    });
  }
}

// A function that prevent spamming

function spamTimeout(msg) {
  let isSpam = false;
  const currentTime = Date.now();

  // Track each user

  if (!userTimeouts[msg.author.id]) {
    userTimeouts[msg.author.id] = {
      lastActionTime: 0,
      timeout: 3000,
      warnings: 0,
      lastWarningTime: 0,
      spamLevel: 1,
    };
  }

  // Check if user exists in the timeouts object

  const user = userTimeouts[msg.author.id];

  // Check is the user is spamming
  if (currentTime - user.lastActionTime < user.timeout) {

    // User is spamming, increase penalty
    if (user.warnings >= user.spamLevel && user.spamLevel <= 7) {
      const penalty = Math.min(
        defaultTimeout * 2 ** user.spamLevel,
        maxUserTimeout
      )

      user.spamLevel++;
      user.warnings = 0;
      user.timeout = penalty;
      user.lastWarningTime = currentTime;

      // Calculate the lpenalty time and convert it to minutes/seconds

      var time =
        penalty > 60000
          ? (time = Math.trunc(penalty / 60000) + " minutes")
          : (time = Math.trunc(penalty / 1000) + " seconds");

      // Inform the user
      msg.reply(
        `**Spam detected:** Penalty increased, please wait **${time}** before sending another message.`
      );
    } 
    // Penalty haven't finished yet
    else {
      user.warnings++;

      // Prevent the bot from spamming

      if (currentTime - user.lastWarningTime > 10000) {

        // Calculate the penalty time left
        const timeLeft = Math.max(
          0,
          user.lastActionTime + user.timeout - currentTime
        );
        var time =
          timeLeft > 60000
            ? (time = Math.trunc(timeLeft / 60000) + " minutes")
            : (time = Math.trunc(timeLeft / 1000) + " seconds");

        // Inform the user

        msg.reply(`Please wait **${time}** before sending another message.`);
      }

      user.lastWarningTime = currentTime;
    }

    isSpam = true;
  } 
  
  // Multiple users unintentional spam

  else if (currentTime - lastResponce <= globalTimeout) {
    msg.reply(
      "**Too many request!** Please wait 2 seconds before sending a message."
    );

    isSpam = true;
  } 
  // User not spamming
  else {
    // Reset warning and user's spam count
    lastResponce = currentTime;
    user.warnings = 0;
    user.timeout = 3000; 
    user.spamLevel = 1; 
    isSpam = false;
  }

  user.lastActionTime = currentTime;

  return isSpam;
}

// Split text to parts

function splitText(text) {
  const chunks = [];
  let start = 0;

  // Delimiters (used to separate sections of the text)

  const primaryDelimiter = [".", "?", "!"];
  const secondaryDelimiter = [";", "\n", "\r", "\t", ")"];
  const reserveDelimiter = [",", ":", " ", "-"];

  while (start < text.length) {
    let end = Math.min(start + 1800, text.length);

    // Split the text if it's too long
    if (end < text.length) {
      let foundDelimiter = false;

      // Look for the last delimiter & cut the text
      for (let i = end; i > start; i--) {
        if (primaryDelimiter.includes(text[i])) {
          end = i + 1; 
          foundDelimiter = true;
          break;
        }
      }

      // If no primary delimiter found, check secondary delimiters
      if (!foundDelimiter) {
        for (let i = end; i > start; i--) {
          if (secondaryDelimiter.includes(text[i])) {
            splitPoint = i + 1;
            foundDelimiter = true;
            break;
          }
        }
      }

      // If no secondary delimiter found, check reserve delimiters
      if (!foundDelimiter) {
        for (let i = end; i > start; i--) {
          if (reserveDelimiter.includes(text[i])) {
            splitPoint = i + 1;
            foundDelimiter = true;
            break;
          }
        }
      }

      // If no delimiter is found, split at maxLength
      if (!foundDelimiter) {
        end = start + maxLength;
      }
    }

    // Push the chunk into the array and update the start position
    chunks.push(text.slice(start, end).trim());
    start = end;
  }

  return chunks;
}
