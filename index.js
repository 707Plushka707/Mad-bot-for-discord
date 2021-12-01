const { Client, Intents, MessageEmbed } = require("discord.js");
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
  let splitText = text.split(' ');
  switch (splitText[0]) {
    case '!yt':
      if (!!text.split('!yt ')[1]) {
        let cleanText = text.split('!yt ')[1];
      getYTList(cleanText).then(function (response) {
          // handle success
          let responseList = response.data.items;
          let responseListString = '';
          console.log(responseList);
          for (let i = 0; i <responseList.length; i++) {
            responseListString = responseListString + `https://youtu.be/${responseList[i].id.videoId}\n`
          }
          msg.reply(responseListString);
        }).catch(function (error) {
          // handle error
          console.log(error);
        })
      }
      break;
    case '!checkprice':
      if (text.split("!checkprice ")[1]) {
        const priceText = text.split("!checkprice ")[1];
        console.log(priceText);
        let params = {};
        params.pageSize = "5";
        params.title = priceText;
        // params.storeID = 21;
        getGamePrice(params).then(function (response) {
          // handle success
          // console.log(response.data);
          let responseList = response.data;
          // let responseListString = '';
          for (let i = 0; i <responseList.length; i++) {
            // responseListString = `${i+1}. ${responseList[i].title} ราคา ${Math.round((responseList[i].salePrice * 33.72)* 1)}฿ ราคาเต็ม ${Math.round((responseList[i].normalPrice * 33.72)* 1)}฿ (ราคาคร่าวๆ)\n
            // `
            msg.channel.send({ embeds: [embedTextReturn(responseList[i])] });
          }

        // return;
        }).catch(function (error) {
          // handle error
          console.log(error);
        })
      }
      break
      // case '!ping': 

      // break;
    default:
      if (text.toLowerCase() == '!ping') {
        const randomColor = Math.floor(Math.random()*16777215).toString(16);
        let pingText = new MessageEmbed().setColor(randomColor).setTitle(`Ping => ${client.ws.ping}ms ${client.ws.ping < 50 ? ' 💚': client.ws.ping > 100 ? ' ❤' : ' 🧡'}`);
        msg.channel.send({ embeds: [pingText] });
      } else if (
        (HaveDot >= 0) && (text.search(/(http)|(www)|(\d\.)/g) < 0)
      ) {
        msg.react("🖕");
        msg.reply(`จุด${textArr[RandomNumbers(6)]}ไร${AddOnText[RandomNumbers(3)]} <@${msg.author.id}>`);
        return;
      } else if ((text.search(/[+]/g) >= 0) && (text.search(/(http)|(www)|(\d\.)/g) < 0)) {
        msg.reply(`บวกหน้ามึงอะ <@${msg.author.id}>`);
        return;
      }
      break;
  }

});
client.login(process.env.TOKEN);

RandomNumbers = (maxNumber) => {
 return Math.floor(Math.random() * maxNumber)
};
getYTList = (msg) => {
  let path = encodeURI(`https://www.googleapis.com/youtube/v3/search?key=AIzaSyAfwXKluq4wVTQe2YYjTdJo_BPJuJl2_7g&part=snippet&q=${msg}`);
  return axios.get(path);
};
getGamePrice = (params) => {
  return axios.get('https://www.cheapshark.com/api/1.0/deals', {
    params: params
  })
}
embedTextReturn = (data) => {
  return new MessageEmbed()
	.setColor('#ffffff')
	.setTitle(data.title)
	.setURL('https://www.cheapshark.com/redirect?dealID=' + data.dealID)
	.setAuthor('cheapshark', 'https://www.cheapshark.com/img/logo_image.png', 'https://www.cheapshark.com')
	.setDescription('Some description here')
	.setThumbnail(data.thumb)
	.addFields(
		{ name: 'ราคา', value: `${Math.round((data.salePrice * 33.72)* 1)} ฿` },
		{ name: 'ราคาเต็ม', value: `${Math.round((data.normalPrice * 33.72)* 1)} ฿` },
		// { name: 'Inline field title', value: 'Some value here', inline: true },
		// { name: 'Inline field title', value: 'Some value here', inline: true },
	)
	// .addField('Inline field title', 'Some value here', true)
	// .setImage('https://i.imgur.com/AfFp7pu.png')
	// .setTimestamp()
	// .setFooter('Some footer text here', 'https://i.imgur.com/AfFp7pu.png');
}
