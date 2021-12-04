import Binance from 'node-binance-api';

const binance = new Binance().options({
  APIKEY: process.env.BN_KEY,
  APISECRET: process.env.BN_SECRET,
});

export const getCurrentPriceAll = () => binance.prices();

export const getCurrentPriceSymbol = (symbol) => binance.prices(symbol);
