import axios from 'axios';
import { Quote } from './db.js';

const { get } = axios;

/**
 * Method: Get
 * Response:
 * {
 *  a: string,
 *  h: string,
 *  q: string
 * }
 */
const zenUrlRandom = 'https://zenquotes.io/api/random/';

const zenGetRandom = async () => {
  const ramdomQuote = await get(zenUrlRandom);
  await Quote.create(ramdomQuote.data[0]);
  return ramdomQuote.data[0];
};

export default zenGetRandom;
