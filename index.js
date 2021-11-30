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
client.on("messageCreate", async (msg) => {
  const textArr = ["ควย", "เหี้ย", "ทำเหี้ย", "ทำส้นตีน", "ทำมะเขือ", "ทำสากกะเบือ"];
  const AddOnText = ['', 'นักหนา', 'วะ'];
  const text = msg.content;
  let HaveDot = text.search(/[.]/g);
  if (text.startsWith('!yt')) {
    let cleanText = text.split('!yt ')[1];
  getYTList(cleanText).then(function (response) {
      // handle success
      let responseList = response.data.items;
      let responseListString = '';
      for (let i = 0; i <responseList.length; i++) {
        responseListString = responseListString + `${i+1}. https://www.youtube.com/watch?v=${responseList[i].id.videoId} \n`
      }
    msg.reply(responseListString);
    }).catch(function (error) {
      // handle error
      console.log(error);
    })
  } else {
    if (
      (HaveDot >= 0) && (text.search(/(http)|(www)|(\d\.)/g) < 0)
    ) {
      msg.react("🖕");
      msg.reply(`จุด${textArr[RandomNumbers(6)]}ไร${AddOnText[RandomNumbers(3)]} <@${msg.author.id}>`);
    } else if ((text.search(/[+]/g) >= 0) && (text.search(/(http)|(www)|(\d\.)/g) < 0)) {
      msg.reply(`บวกหน้ามึงอะ <@${msg.author.id}>`);
    }
  }
});
client.login(process.env.TOKEN);

RandomNumbers = (maxNumber) => {
 return Math.floor(Math.random() * maxNumber)
};
getYTList = (msg) => {
  let path = encodeURI(`https://www.googleapis.com/youtube/v3/search?key=AIzaSyAfwXKluq4wVTQe2YYjTdJo_BPJuJl2_7g&q=${msg}`);
  return axios.get(path);
};
