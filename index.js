import { Client, Intents, MessageEmbed } from "discord.js";
import { config } from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import axios from "axios";
const { get } = axios;
import { sequelize } from "./db.js";
import { zenGetRandom } from "./zenquotes.js";

import {
  generateDependencyReport,
  joinVoiceChannel,
  VoiceConnectionStatus,
  StreamType,
  createAudioResource,
  createAudioPlayer,
  getVoiceConnection,
} from "@discordjs/voice";

config();

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

client.on("ready", () => {
  console.log("BOT is running");
  testDB();
});
client.on("messageCreate", async (msg) => {
  const textArr = [
    "ควย",
    "เหี้ย",
    "ทำเหี้ย",
    "ทำส้นตีน",
    "ทำมะเขือ",
    "ทำสากกะเบือ",
  ];
  const AddOnText = ["", "นักหนา", "วะ"];
  const text = msg.content.toLowerCase();
  let HaveDot = text.search(/[.]/g);
  let splitText = text.split(" ");
  let limit = 5;
  switch (splitText[0]) {
    case "!yt":
      if (!!text.split("!yt ")[1]) {
        let cleanText = text.split("!yt ")[1];
        if (splitText[splitText.length - 1].startsWith("--")) {
          limit = splitText[splitText.length - 1].split("--")[1];
        }
        getYTList(cleanText, limit)
          .then(function (response) {
            // handle success
            let responseList = response.data.items;
            let responseListString = "";
            for (let i = 0; i < responseList.length; i++) {
              responseListString =
                responseListString +
                `https://youtu.be/${responseList[i].id.videoId}\n`;
            }
            msg.reply(responseListString);
          })
          .catch(function (error) {
            // handle error
            console.log(error);
          });
      }
      break;
    case "!price":
      if (text.split("!price ")[1]) {
        const pText = text.split("!price ")[1];
        console.log(pText);
        getSteamGameList()
          .then(function (response) {
            // handle success
            console.log(response.data.applist.apps);
            let responseList = response.data.applist.apps;
            let rArray = filterItems(pText, responseList);
            console.log(rArray);
            // let responseListString = '';
            if (rArray.length > 0) {
              for (
                let i = 0;
                i < (rArray.length > 5 ? 5 : rArray.length);
                i++
              ) {
                console.log(rArray[i]);
                // responseListString = `${i+1}. ${responseList[i].title} ราคา ${Math.round((responseList[i].salePrice * 33.72)* 1)}฿ ราคาเต็ม ${Math.round((responseList[i].normalPrice * 33.72)* 1)}฿ (ราคาคร่าวๆ)\n
                // `
                msg.channel.send({ embeds: [embedTextReturn(rArray[i])] });
              }
            }
            // return;
          })
          .catch(function (error) {
            // handle error
            console.log(error);
          });
      }
      break;
    case "!quote":
      const response = await zenGetRandom();
      const formattedResponse = `${response.q} -- ${response.a}`;
      msg.reply(formattedResponse);
      break;
    case "!sing":
      voiceActivity(msg);
      break;
    case "!stfu":
      const connection = getVoiceConnection(msg.guild.id);
      if (!connection) {
        msg.reply("ต้องการอะไรจากสังคม?");
        return;
      }
      const subscription = connection.subscribe(player);

      if (subscription) {
        setTimeout(() => {
          player.stop();
          subscription.unsubscribe();
          connection.destroy();
        }, 3_000);
      }
      case "!ping":
        let pingText = new MessageEmbed()
          .setColor(randomColor())
          .setTitle(
            `Ping => ${client.ws.ping}ms ${
              client.ws.ping < 50 ? " 💚" : client.ws.ping > 100 ? " ❤" : " 🧡"
            }`
          );
        msg.channel.send({ embeds: [pingText] });
        break;
    default:
      if (HaveDot >= 0 && text.search(/(http)|(www)|(\d\.)/g) < 0) {
        msg.react("🖕");
        msg.reply(
          `จุด${textArr[RandomNumbers(6)]}ไร${AddOnText[RandomNumbers(3)]} <@${
            msg.author.id
          }>`
        );
        return;
      } else if (
        text.search(/[+]/g) >= 0 &&
        text.search(/(http)|(www)|(\d\.)/g) < 0
      ) {
        msg.reply(`บวกหน้ามึงอะ <@${msg.author.id}>`);
        return;
      }
      break;
  }
});
client.login(process.env.TOKEN);

const voiceActivity = (msg) => {
  if (!msg.member?.voice?.channel?.id) {
    msg.reply("เข้า Voice chat ก่อนดิ๊");
    return;
  }
  const connection = joinVoiceChannel({
    channelId: msg.member.voice.channel.id,
    guildId: msg.guild.id,
    adapterCreator: msg.guild.voiceAdapterCreator,
  });
  let songPathArray = ["audio/thai.ogg", `audio/NSC/${RandomNumbers(1)}.mp3`];
  let resource = createAudioResource(join(__dirname, songPathArray[RandomNumbers(1)]), {
    inputType: StreamType.OggOpus,
  });
  player.play(resource);

  connection.on(VoiceConnectionStatus.Ready, (oldState, newState) => {
    console.log("Connection is in the Ready state!");
    connection.subscribe(player);
  });

  return connection;
};

const player = createAudioPlayer();

async function testDB() {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
    console.log(generateDependencyReport());
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

const RandomNumbers = (maxNumber) => {
  return Math.floor(Math.random() * maxNumber);
};
const getYTList = (msg, limit) => {
  let path = encodeURI(
    `https://www.googleapis.com/youtube/v3/search?key=AIzaSyAfwXKluq4wVTQe2YYjTdJo_BPJuJl2_7g&maxResults=${limit}&type=video&part=snippet&q=${msg}`
  );
  return get(path);
};
const getGamePrice = (params) => {
  return get("https://www.cheapshark.com/api/1.0/deals", {
    params: params,
  });
};
const getSteamGameList = () => {
  return get("https://api.steampowered.com/ISteamApps/GetAppList/v2/");
};
const getSteamGameDetail = (id) => {
  return get(
    `https://store.steampowered.com/api/appdetails?appids=${id}&cc=th&l=th`
  );
};
const embedTextReturn = (data) => {
  getSteamGameDetail(data.appid)
    .then(function (response) {
      console.log(response);
      return new MessageEmbed()
        .setColor(randomColor())
        .setTitle(data.name)
        .setDescription("Some description here");
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
  // .setURL('https://www.cheapshark.com/redirect?dealID=' + data.dealID)
  // .setAuthor('cheapshark', 'https://www.cheapshark.com/img/logo_image.png', 'https://www.cheapshark.com')
  // .setDescription('Some description here')
  // .setThumbnail(data.thumb)
  // .addFields(
  // 	{ name: 'ราคา', value: `${Math.round((data.salePrice * 33.72)* 1)} ฿` },
  // 	{ name: 'ราคาเต็ม', value: `${Math.round((data.normalPrice * 33.72)* 1)} ฿` },
  // 	// { name: 'Inline field title', value: 'Some value here', inline: true },
  // 	// { name: 'Inline field title', value: 'Some value here', inline: true },
  // )
  // .addField('Inline field title', 'Some value here', true)
  // .setImage('https://i.imgur.com/AfFp7pu.png')
  // .setTimestamp()
  // .setFooter('Some footer text here', 'https://i.imgur.com/AfFp7pu.png');
};
const filterItems = (needle, heystack) => {
  let query = needle.toLowerCase();
  return heystack.filter((item) => item.name.toLowerCase().indexOf(query) >= 0);
};
const randomColor = () => {
  return Math.floor(Math.random() * 16777215).toString(16);
};
