/* eslint-disable no-underscore-dangle */
import * as voice from '@discordjs/voice';
import axios from 'axios';
import { Client, Intents, MessageEmbed } from 'discord.js';
import { config } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './db.js';
import { zenGetRandom } from './zenquotes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { get } = axios;

config();

const player = voice.createAudioPlayer();

const testDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    console.log(voice.generateDependencyReport());
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

const randomNumbers = (maxNumber) => Math.floor(Math.random() * maxNumber);
const getYTList = (msg, limit) => {
  const path = encodeURI(
    `https://www.googleapis.com/youtube/v3/search?key=AIzaSyAfwXKluq4wVTQe2YYjTdJo_BPJuJl2_7g&maxResults=${limit}&type=video&part=snippet&q=${msg}`,
  );
  return get(path);
};
const filterItems = (needle, heystack) => {
  const query = needle.toLowerCase();
  return heystack.filter((item) => item.name.toLowerCase().indexOf(query) >= 0);
};
const randomColor = () => Math.floor(Math.random() * 16777215).toString(16);
const getSteamGameList = () => get('https://api.steampowered.com/ISteamApps/GetAppList/v2/');
const getSteamGameDetail = (id) => get(`https://store.steampowered.com/api/appdetails?appids=${id}&cc=th&l=th`);
const embedTextReturn = (data) => {
  getSteamGameDetail(data.appid)
    .then((response) => {
      console.log(response);
      return new MessageEmbed()
        .setColor(randomColor())
        .setTitle(data.name)
        .setDescription('Some description here');
    })
    .catch((error) => {
      console.log(error);
    });
};

const voiceActivity = (msg) => {
  if (!msg.member?.voice?.channel?.id) {
    msg.reply('เข้า Voice chat ก่อนดิ๊');
    return null;
  }
  const connection = voice.joinVoiceChannel({
    channelId: msg.member.voice.channel.id,
    guildId: msg.guild.id,
    adapterCreator: msg.guild.voiceAdapterCreator,
  });

  const resource = voice.createAudioResource(
    join(__dirname, 'audio/thai.ogg'),
    {
      inputType: voice.StreamType.OggOpus,
    },
  );
  player.play(resource);

  connection.on(voice.VoiceConnectionStatus.Ready, () => {
    console.log('Connection is in the Ready state!');
    connection.subscribe(player);
  });

  return connection;
};

/** Main Program */

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

client.on('ready', () => {
  console.log('BOT is running');
  testDB();
});
client.on('messageCreate', async (msg) => {
  const textArr = [
    'ควย',
    'เหี้ย',
    'ทำเหี้ย',
    'ทำส้นตีน',
    'ทำมะเขือ',
    'ทำสากกะเบือ',
  ];
  const AddOnText = ['', 'นักหนา', 'วะ'];
  const text = msg.content.toLowerCase();
  const HaveDot = text.search(/[.]/g);
  const splitText = text.split(' ');
  let limit = 5;
  switch (splitText[0]) {
    case '!yt':
      if (text.split('!yt ')[1]) {
        const cleanText = text.split('!yt ')[1];
        if (splitText[splitText.length - 1].startsWith('--')) {
          [, limit] = splitText[splitText.length - 1].split('--');
        }
        getYTList(cleanText, limit)
          .then((response) => {
            // handle success
            const responseList = response.data.items;
            let responseListString = '';
            for (let i = 0; i < responseList.length; i += 1) {
              responseListString += `https://youtu.be/${responseList[i].id.videoId}\n`;
            }
            msg.reply(responseListString);
          })
          .catch((error) => {
            // handle error
            console.log(error);
          });
      }
      break;
    case '!price':
      if (text.split('!price ')[1]) {
        const pText = text.split('!price ')[1];
        console.log(pText);
        getSteamGameList()
          .then((response) => {
            // handle success
            console.log(response.data.applist.apps);
            const responseList = response.data.applist.apps;
            const rArray = filterItems(pText, responseList);
            console.log(rArray);
            // let responseListString = '';
            if (rArray.length > 0) {
              for (
                let i = 0;
                i < (rArray.length > 5 ? 5 : rArray.length);
                i += 1
              ) {
                console.log(rArray[i]);
                // responseListString = `${i+1}. ${responseList[i].title} ราคา ${Math.round((responseList[i].salePrice * 33.72)* 1)}฿ ราคาเต็ม ${Math.round((responseList[i].normalPrice * 33.72)* 1)}฿ (ราคาคร่าวๆ)\n
                // `
                msg.channel.send({ embeds: [embedTextReturn(rArray[i])] });
              }
            }
            // return;
          })
          .catch((error) => {
            // handle error
            console.log(error);
          });
      }
      break;
    case '!quote': {
      const response = await zenGetRandom();
      const formattedResponse = `${response.q} -- ${response.a}`;
      msg.reply(formattedResponse);
      break;
    }
    case '!sing': {
      voiceActivity(msg);
      break;
    }
    case '!stfu': {
      const connection = voice.getVoiceConnection(msg.guild.id);
      if (!connection) {
        msg.reply('ต้องการอะไรจากสังคม?');
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
      break;
    }
    case '!ping': {
      const pingText = new MessageEmbed()
        .setColor(randomColor())
        .setTitle(
          `Ping => ${client.ws.ping}ms ${client.ws.ping < 50 ? ' 💚' : client.ws.ping > 100 ? ' ❤' : ' 🧡'
          }`,
        );
      msg.channel.send({ embeds: [pingText] });
      break;
    }
    default:
      if (
        HaveDot >= 0
        && text.search(/(http)|(www)|(\d\.)/g) < 0
        && msg.author.id !== client.user.id
      ) {
        msg.react('🖕');
        msg.reply(
          `จุด${textArr[randomNumbers(6)]}ไร${AddOnText[randomNumbers(3)]} <@${msg.author.id
          }>`,
        );
      } else if (
        text.search(/[+]/g) >= 0
        && text.search(/(http)|(www)|(\d\.)/g) < 0
      ) {
        msg.reply(`บวกหน้ามึงอะ <@${msg.author.id}>`);
      }
      break;
  }
});
client.login(process.env.TOKEN);
