/* eslint-disable no-underscore-dangle */
import { getVoiceConnection, generateDependencyReport } from '@discordjs/voice';
import axios from 'axios';
import { Client, Intents, MessageEmbed } from 'discord.js';
import { config } from 'dotenv';
import { sequelize } from './db.js';
import { voiceConnect, voicePlay, voiceStop } from './voice.js';
import zenGetRandom from './zenquotes.js';
import { randomColor, filterItems, randomNumbers } from './utils.js';
import { getSteamGameList, getSteamGameDetail, embedTextReturn } from './price.js';
import { getCurrentPriceSymbol, getCurrentPriceAll } from './binance.js';

const { get } = axios;

config();

const debugStatus = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    console.log(generateDependencyReport());
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

const getYTList = (msg, limit) => {
  const path = encodeURI(
    `https://www.googleapis.com/youtube/v3/search?key=AIzaSyAfwXKluq4wVTQe2YYjTdJo_BPJuJl2_7g&maxResults=${limit}&type=video&part=snippet&q=${msg}`,
  );
  return get(path);
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
  debugStatus();
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
  const text = msg.content;
  const HaveDot = text.search(/[.]/g);
  const splitText = text.split(' ');
  let limit = 5;
  switch (splitText[0].toLowerCase()) {
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
      // !sing [ytUrl]
      let ytUrl = splitText[1];
      if (!ytUrl) {
        ytUrl = 'https://www.youtube.com/watch?v=YTgVDlE1HII';
      }
      const info = await voicePlay(voiceConnect(msg), ytUrl);
      msg.reply(info.title);
      break;
    }
    case '!stfu': {
      const connection = getVoiceConnection(msg.guild.id);
      if (!connection) {
        msg.reply('ต้องการอะไรจากสังคม?');
        return;
      }
      voiceStop(connection);
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
    case '!bn': {
      const symbol = splitText[1];
      if (!symbol) {
        msg.reply('ระบุสัญลักษณ์ด้วย เช่น !bn ETHBTC เพราะมันเยอะแสดงไม่พอ');
        return;
      }

      const symbolUpper = symbol.toUpperCase();

      try {
        const data = await getCurrentPriceSymbol(symbolUpper);
        msg.reply(`${symbolUpper}: ${data[symbolUpper]}`);
      } catch (e) {
        msg.reply('อย่ามามั่วสัญลักษณ์ ถ้าไม่รู้ไปดูที่ https://www.binance.com/en/markets');
        msg.react('🖕');
      }
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
