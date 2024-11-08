require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const configuration = require("../../config.json");

const genAI = new GoogleGenerativeAI(process.env["GEMINI_TOKEN"]);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

let isNewChat = true;
let chat, time;

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
]

module.exports = async (msg, id) => {


  if (msg.attachments.size > 0) {
    isMedia = false;

    msg.attachments.forEach((attachment) => {
      if (mediaTypes.includes(attachment.contentType)) {
        isMedia = true;
      }
    });

    if (isMedia) {
      console.log("Received");

      let mediaParts = [];

      let index = 1;

      var unsupported = 0;

      msg.attachments.forEach((attachment) => {
        if (!mediaTypes.includes(attachment.contentType)) {
          index++;
          unsupported++;
          return;
        }

        var request = require("request").defaults({ encoding: null });

        let media;

        request.get(attachment.url, async function (error, response, body) {
          console.log("Fetching")
          if (!error && response.statusCode == 200) {
            media = Buffer.from(body).toString("base64");
            var mimeType = attachment.contentType;
            mediaParts.push({
              inlineData: {
                data: media,
                mimeType,
              },
            });

            console.log("Buffered")

            if (msg.attachments.size === index) {
              console.log("Analysing")

              const generatedContent = await model.generateContent([
                msg.content.replace(`<@${id}> `, ""),
                ...mediaParts,
              ]);

              if (unsupported == 0) {
                msg.reply(generatedContent.response.text());
              } else if (unsupported > 0) {
                msg.reply(
                  `There exist **${unsupported} unsupported file(s)** among these medias.` + "\n\n" +
                    generatedContent.response.text()
                );
              }
            } else {
              index++;
            }
          }
        });
      });
    } else {
      if (msg.attachments.size == 1) {
        msg.reply("Sorry, but `" + msg.attachments.first().contentType + "` file type **is not supported**.")
      } else if (msg.attachments.size > 1) {
        let attachmentsType = "";

        msg.attachments.forEach((attachment) => {
          var type = "`" + attachment.contentType + "` ";

          if (!attachmentsType.includes(type)) {
            attachmentsType += type;
          }
        })

        msg.reply("Sorry, but " + attachmentsType + "file types **are not supported**.")
      }
    }

  } else if (isNewChat) {
    time = setTimeout(function () {
      isNewChat = true;
    }, 300000);

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

    console.log("nothing");
    const response = await chat.sendMessage(
      msg.content.replace(`<@${id}> `, "")
    );
    const text = response.response.text();
    msg.reply(text);
  } else {
    clearTimeout(time);

    console.log("nothing");

    time = setTimeout(function () {
      isNewChat = true;
    }, 30000);

    const response = await chat.sendMessage(
      msg.content.replace(`<@${id}> `, "")
    );
    const text = response.response.text();

    msg.reply(text);
  }
};

function fileToGenerativePart(url, mimeType) {
  var request = require("request").defaults({ encoding: null });

  let image;

  request.get(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      image =
        "data:" +
        response.headers["content-type"] +
        ";base64," +
        Buffer.from(body).toString("base64");
      console.log(image);
    }
  });

  return {
    inlineData: {
      data: image,
      mimeType,
    },
  };
}
