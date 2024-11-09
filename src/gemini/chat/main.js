require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const configuration = require("../../config.json");

// Creating the Gemini model

const genAI = new GoogleGenerativeAI(process.env["GEMINI_TOKEN"]);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

let isNewChat = true;
let chat, time;

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

              var modelResponse = generatedContent.response.text();

              // Responding to the message & adding it to the conversation history

              var response =
                unsupported > 0
                  ? `There exist **${unsupported} unsupported file(s)** among these medias, ` +
                    "type `?media` for more info.\n\n" +
                    modelResponse
                  : modelResponse;

              msg.reply(response);

              addChat(content, response);
            } else {
              index++;
            }
          } else {
            // Error fetching the media

            var response = "Sorry, but there was an error fetching the URL. \n\n More Info: \n **Status Code:** `" + res.statusCode + "`"; 

            msg.reply(response);

            addChat(content, response);
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

        addChat(content, response);
      } else if (msg.attachments.size > 1) {
        let attachmentsType = "";

        msg.attachments.forEach((attachment) => {
          var type = "`" + attachment.contentType + "` ";

          if (!attachmentsType.includes(type)) {
            attachmentsType += type;
          }
        });

        var response =
          "Sorry, but " + attachmentsType + "file types **are not supported**, type `?media` for more info.";

        msg.reply(response);

        addChat(content, response);
      }
    }
  }

  // Check if it's a new chat or the timeout have finished
  else if (isNewChat) {
    // Set a timeout to restart a new conversation

    time = setTimeout(function () {
      isNewChat = true;
    }, 300000);

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
    msg.reply(text);
  }

  // There is already a conversation
  else {
    // Reset the timeout

    clearTimeout(time);

    time = setTimeout(function () {
      isNewChat = true;
    }, 30000);

    // Respond to the message

    const response = await chat.sendMessage(content);
    const text = response.response.text();

    msg.reply(text);
  }
};

// A function to add messages to the conversation history

function addChat(userText, modelText) {
  // Check if there is already a conversation

  if (chat) {
    // Reset the timeout

    clearTimeout(time);

    time = setTimeout(function () {
      isNewChat = true;
    }, 30000);

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
    }, 300000);

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
