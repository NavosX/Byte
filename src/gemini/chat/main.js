require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const configuration = require("../../config.json")

const genAI = new GoogleGenerativeAI(process.env["GEMINI_TOKEN"]);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

let isNewChat = true;
let chat, time;

module.exports = async (msg, id) => {

    if (isNewChat) {

        time = setTimeout( function() {
            isNewChat = true;
            console.log("kill")
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
          ]      
        });

        isNewChat = false;

        const response = await chat.sendMessage(msg.content.replace(`<@${id}> `,''));
        const text = response.response.text();

        msg.reply(text);
    } else {

        clearTimeout(time);

        time = setTimeout( function() {
            isNewChat = true;
        }, 30000);

        const response = await chat.sendMessage(msg.content.replace(`<@${id}> `,''));
        const text = response.response.text();
  
        msg.reply(text);

    }
};
