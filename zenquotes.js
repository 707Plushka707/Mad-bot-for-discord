import axios from "axios";
const { get } = axios;
import { Quote } from "./db.js";

const zenUrlRandom = "https://zenquotes.io/api/random/";

const zenGetRandom = async (params) => {
  const ramdomQuote = await get(zenUrlRandom, {
    params: params,
  });
  await Quote.create(ramdomQuote.data[0]);
  return ramdomQuote.data[0];
};

export { zenGetRandom };
