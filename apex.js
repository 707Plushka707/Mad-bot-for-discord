import axios from 'axios';
const { get } = axios;

export const getApexMapRotation = () => {
    const path = `https://api.mozambiquehe.re/maprotation?version=2&auth=${process.env.APEX_TOKEN}`;
    return get(path);
  };
  export const getApexRank = (name) => {
    const path = `api.mozambiquehe.re/bridge?version=5&platform=PC&player=${name}&auth=${process.env.APEX_TOKEN}`;
    return get(path);
  };
  