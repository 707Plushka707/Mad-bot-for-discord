/* eslint-disable no-underscore-dangle */
import { getVoiceConnection, generateDependencyReport } from '@discordjs/voice';
import axios from 'axios';
import { Client, Intents, MessageEmbed } from 'discord.js';
import { config } from 'dotenv';
import ytdl from 'ytdl-core';
import { sequelize } from './db.js';
import {
  voiceConnect, voicePlay, voiceStop, skipPlay, clearPlay,
} from './voice.js';
import zenGetRandom from './zenquotes.js';
import { randomColor, filterItems, randomNumbers } from './utils.js';
import { getSteamGameList, embedTextReturn } from './price.js';
import { getCurrentPriceSymbol } from './binance.js';
import { getApexMapRotation, getApexRank } from './apex.js';
// import { getApexMapRotation, getApexRank } from './apex.js';

const { get } = axios;

config();

/**  Global State
 *  musicQueue: URL
*/
const globalState = {
  musicQueue: [],
};

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

const getYTinfo = async (url) => {
  const info = await ytdl.getInfo(url);
  return {
    title: info.videoDetails.title,
    description: info.videoDetails.description,
    thumbnail: info.videoDetails.thumbnails[2].url,
  };
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
  client.user.setActivity('!help', ({ type: 'WATCHING' }));
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
  const AddOnText = [' ???', 'นักหนา ??', 'วะ ?!?'];
  const text = msg.content;
  const HaveDot = text.search(/[.]/g);
  const splitText = text.split(' ');
  let limit = 5;
  // splitText[0] is command
  // splitText[1] is params
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
      // !sing [ytUrl] || [ytSearchKey]
      const connection = voiceConnect(msg);
      if (!connection) return null;

      let ytSearch = text.split('!sing')[1];

      if (!ytSearch) {
        ytSearch = 'https://www.youtube.com/watch?v=YTgVDlE1HII';
      }

      // Youtube URL handle
      if (ytSearch.startsWith('https://') || ytSearch.startsWith('www.')) {
        globalState.musicQueue.push(ytSearch);
      } else {
        await getYTList(ytSearch, 1)
          .then((response) => {
            // handle success
            const responseList = response.data.items;
            const responseString = `https://youtu.be/${responseList[0].id.videoId}`;
            globalState.musicQueue.push(responseString);
          })
          .catch((error) => {
            // handle error
            msg.reply('❌ Error สงสังค้นหาเกินโควต้าแล้ว ลองใส่เป็น Link แทนนะ ');
            console.log(error);
          });
      }

      /** When has one song in queue start play it or just wait queue run */
      if (globalState.musicQueue.length === 1) {
        await voicePlay(connection, globalState);
      }

      /** Send feednack to discord */
      const info = await getYTinfo(globalState.musicQueue.at(-1));
      const descriptionText = new MessageEmbed()
        .setColor(randomColor())
        .setTitle(`${globalState.musicQueue.length > 1 ? 'เพิ่มลงคิว 😊' : 'กำลังเล่น ▶️'}  ${info.title}`)
        .setThumbnail(info.thumbnail);
      msg.channel.send({ embeds: [descriptionText] });
      break;
    }
    case '!stfu': {
      const connection = getVoiceConnection(msg.guild.id);
      if (!connection) {
        msg.reply('ต้องการอะไรจากสังคม?');
        return null;
      }
      voiceStop(connection, globalState);
      globalState.musicQueue = [];
      break;
    }
    case '!clear': {
      const connection = getVoiceConnection(msg.guild.id);
      if (!connection) {
        msg.reply('clear เหี้ยไรมึงไม่ได้เปิดเพลง 🖕');
        msg.react('🖕');
      } else {
        clearPlay(connection, globalState);
        const descriptionText = new MessageEmbed()
          .setColor(randomColor())
          .setTitle('Clear Queue ให้แล้วจ้า 😘');
        msg.channel.send({ embeds: [descriptionText] });
      }
      break;
    }
    case '!skip': {
      const connection = getVoiceConnection(msg.guild.id);
      if (!connection) {
        msg.reply('skip เหี้ยไรมึงไม่ได้เปิดเพลง 🖕');
        msg.react('🖕');
      } else {
        const info = await skipPlay(connection, globalState);
        if (!info) {
          msg.reply('ไม่มีเพลงให้เล่นละ บรัย 👋');
          msg.react('🖕');
          return null;
        }
        const descriptionText = new MessageEmbed()
          .setColor(randomColor())
          .setTitle(`กำลังเล่น ▶️ ${info.title}`)
          .setThumbnail(info.thumbnail);
        msg.channel.send({ embeds: [descriptionText] });
      }
      break;
    }
    case '!ping': {
      const pingText = new MessageEmbed()
        .setColor(randomColor())
        .setTitle(
          `Ping => ${client.ws.ping}ms ${client.ws.ping < 50 ? ' 💚' : client.ws.ping > 100 ? ' 💛' : ' 🧡'
          }`,
        );
      msg.channel.send({ embeds: [pingText] });
      break;
    }
    case '!help': {
      const helpText = new MessageEmbed()
        .setColor(randomColor())
        .setTitle(
          'HELP for noMoreDot BOT',
        ).setDescription(`นี่คือ Bot เอาไว้สำหรับด่าโดยเฉพาะ แต่ก็มีคำสั่งอื่นๆให้ใช้ด้วยเช่นกัน \n
        มีคำสั่งหลายอย่าง และอาจมีเพิ่มในอนาคต \n
        !ping = ทดสอบค่า ping \n
        !quote = เอาไว้หา quote เผื่อเอาไปโพสเฟสอวดสาวได้ \n
        !yt = เอาไว้ค้นหาวิดิโอใน Youtube เช่น !yt แมวเหมียว \n **!yt มี Option เพิ่มเติมคือ -- ตามด้วยตัวเลข คือการกำหนดวิดิโอที่จะแสดง มากสุด 50 วิดิโอ เช่น !yt แมว --1
        !sing = เอาไว้เปิดเพลงโดยต้องพิมพ์ชื่อเพลงตาม เช่น !sing แมวเหมียว \n
        !queue = เอาไว้เชคคิวเพลง \n
        !skip = เอาไว้ skip เพลงที่เล่นอยู่ \n
        !clear = เอาไว้เคลียร์เพลงในคิวทั้งหมดออก \n
        !stfu = เอาไว้ Disconnect Bot ออกจากช่อง \n
        !bn =  เอาไว้แสดงค่าเงิน Cryptocurrency ที่ต้องการ เช่น !bn BTCUSDT \n
        !apex = เอาไว้เช็ค MAP APEX
        `);
      msg.channel.send({ embeds: [helpText] });
      break;
    }
    case '!queue': {
      let stringQueue = '';
      if (globalState.musicQueue.length > 0) {
        for (let index = 0; index < globalState.musicQueue.length; index += 1) {
          const element = globalState.musicQueue[index];
          stringQueue += `${index === 0 ? '▶️ ' : ''}${index + 1}. ${element}\n`;
        }
        msg.reply(`มีคิวเพลงตามนี้จ้า \n ${stringQueue}`);
      } else {
        msg.reply('ไม่มีคิวเพลง ลองเพิ่มดูสักเพลงสิ ❤️');
      }
      break;
    }
    case '!bn': {
      const symbol = splitText[1];
      if (!symbol) {
        msg.reply('ระบุสัญลักษณ์ด้วย เช่น !bn ETHBTC เพราะมันเยอะแสดงไม่พอ');
        return null;
      }
      const symbolUpper = symbol.toUpperCase();
      try {
        const data = await getCurrentPriceSymbol(symbolUpper);
        msg.reply(`${symbolUpper}: ${data[symbolUpper]}$`);
      } catch (e) {
        msg.reply('อย่ามามั่วสัญลักษณ์ ถ้าไม่รู้ไปดูที่ https://www.binance.com/en/markets');
        msg.react('🖕');
      }
      break;
    }
    case '!apex': {
      const getApi = await getApexMapRotation();
      const { data } = getApi;
      const MapTextTitle = new MessageEmbed()
        .setColor(randomColor())
        .setTitle(
          'APEX MAP ROTATION',
        )
        .setImage(data.battle_royale.current.asset)
        .addFields(
          { name: 'Battle Royale', value: `Battle Royale Ranked : ${data.ranked.current.map}` },
          { name: 'Current', value: `${data.battle_royale.current.map} ⏱️ ${data.battle_royale.current.remainingTimer} Hr.`, inline: true },
          { name: 'Next', value: `${data.battle_royale.next.map} ⏱️ ${data.battle_royale.next.DurationInMinutes / 60} Hr.`, inline: true },
          { name: '\u200B', value: '\u200B' },
          { name: 'Arenas', value: `Arenas Ranked : ${data.arenasRanked.current.map} ⏱️ ${data.arenasRanked.current.remainingTimer} Hr.` },
          { name: 'Current', value: `${data.arenas.current.map} ⏱️ ${data.arenas.current.remainingTimer} Hr.`, inline: true },
          { name: 'Next', value: `${data.arenas.next.map} ⏱️ ${data.arenas.next.DurationInMinutes / 60} Hr.`, inline: true },
        );
      msg.channel.send({ embeds: [MapTextTitle] });
      break;
    }
    /*   case '!rank': {
      const name = splitText[1];
      if (!name) {
        msg.reply('บอกชื่อด้วยดิ ไม่บอกจะรู้มั้ยอะ ? (ใช้เป็นชื่อของ Origin นะ ของ Steam จะหาไม่เจอ ❤️)');
        return null;
      }
      const getApi = await getApexRank(name);
      console.log(getApi);
      // const data = getApi.data;
      //   const MapTextTitle = new MessageEmbed()
      //   .setColor(randomColor())
      //   .setTitle(
      //     'APEX MAP ROTATION',
      //   )
      //   .setImage(data.battle_royale.current.asset).addFields(
      //     { name: 'Battle Royale', value: `Battle Royale Ranked : ${data.ranked.current.map}` },
      //     { name: 'Current', value: `${data.battle_royale.current.map} ⏱️ ${data.battle_royale.current.remainingTimer} Hr.`, inline: true },
      //     { name: 'Next', value: `${data.battle_royale.next.map} ⏱️ ${data.battle_royale.next.DurationInMinutes / 60} Hr.`, inline: true },
      //     { name: '\u200B', value: '\u200B' },
      //     { name: 'Arenas', value: `Arenas Ranked : ${data.arenasRanked.current.map} ⏱️ ${data.arenasRanked.current.remainingTimer} Hr.` },
      //     { name: 'Current', value: `${data.arenas.current.map} ⏱️ ${data.arenas.current.remainingTimer} Hr.`, inline: true },
      //     { name: 'Next', value: `${data.arenas.next.map} ⏱️ ${data.arenas.next.DurationInMinutes / 60} Hr.`, inline: true },
      //   );
      //   msg.channel.send({ embeds: [MapTextTitle] });
    break;
  } */
    default:
      if (
        HaveDot >= 0
        && text.search(/(http)|(www)|(\d\.)/g) < 0
        && msg.author.id !== client.user.id
      ) {
        msg.react('🖕');
        msg.reply(
          `จุด${textArr[randomNumbers(textArr.length)]}ไร${AddOnText[randomNumbers(AddOnText.length)]} <@${msg.author.id}>`,
        );
      } else if (
        text.search(/[+]/g) >= 0
        && text.search(/(http)|(www)|(\d\.)/g) < 0
      ) {
        msg.reply(`บวกหน้ามึงอะ <@${msg.author.id}>`);
      } else if (text.includes('ฝนตกไหม')) {
        msg.channel.send('สภาพอากาศตอนนี้ @สุวรรณภูมิ', { files: ['https://weather.tmd.go.th/svp/svp240_latest.jpg'] } );
      }
      return null;
  }
  return null;
});

client.login(process.env.TOKEN);
