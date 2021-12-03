import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import { randomColor } from './utils.js';

const { get } = axios;

export const getSteamGameList = () => get('https://api.steampowered.com/ISteamApps/GetAppList/v2/');

export const getSteamGameDetail = (id) => get(`https://store.steampowered.com/api/appdetails?appids=${id}&cc=th&l=th`);

export const embedTextReturn = (data) => {
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
