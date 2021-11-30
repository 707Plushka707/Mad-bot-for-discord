const { Client, Intents } = require("discord.js");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
client.on("ready", () => {
  console.log("BOT is running");
});
client.on("messageCreate", (msg) => {
  const textArr = ["ควย", "เหี้ย", "ทำเหี้ย", "ทำส้นตีน"];
  const text = msg.content;
  let RandomNumber = Math.floor(Math.random() * 4);
  let HaveDot = text.search(/[.]/g);
  if (text.startsWith('!yt')) {
    let cleanText = text.split('!yt ')[1];
    getMovieList(cleanText).then(function (response) {
      // handle success
      console.log(response);
    }).catch(function (error) {
      // handle error
      console.log(error);
    })
  } else {
    if (
      (HaveDot >= 0) &&
      !text.startsWith("http") &&
      !text.startsWith("www")
    ) {
      msg.react("🖕");
      msg.reply(`จุด${textArr[RandomNumber]}ไร <@${msg.author.id}>`);
    }
  }
});
client.login(process.env.TOKEN);

getMovieList = (msg) => {
  return axios.get(`https://www.googleapis.com/youtube/v3/search?access_token=&q=${msg}`, { headers: {'Authorization' : `Bearer ${tokenStr}`} });
};
