const { Client, Intents } = require("discord.js");
const dotenv = require("dotenv");
const http = require("http");
http.createServer(function (request, response) {
  dotenv.config();

  const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  });
  client.on("ready", () => {
    console.log("Server Running ON Port 5000");
  });
  client.on("messageCreate", (msg) => {
    const textArr = ["ควย", "เหี้ย", "ทำเหี้ย", "ทำส้นตีน"];
    const text = msg.content;
    let RandomNumber = Math.floor(Math.random() * 4);
    let HaveDot = text.search(/[.]/g);
    if (HaveDot >= 0 || text == "จุด") {
      msg.react("🖕");
      msg.reply(`จุด${textArr[RandomNumber]}ไร <@${msg.author.id}>`);
    }
  });
  client.login(process.env.TOKEN);
}).listen(process.env.PORT || 5000)
