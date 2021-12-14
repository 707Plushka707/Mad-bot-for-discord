import {
  AudioPlayerStatus,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
} from '@discordjs/voice';
import ytdl from 'ytdl-core';

const player = createAudioPlayer();

export const voiceConnect = (msg) => {
  let connection = getVoiceConnection(msg.guild.id);
  if (connection) return connection;

  if (!msg.member?.voice?.channel?.id) {
    msg.reply('เข้า Voice chat ก่อนดิ๊');
    return null;
  }
  connection = joinVoiceChannel({
    channelId: msg.member.voice.channel.id,
    guildId: msg.guild.id,
    adapterCreator: msg.guild.voiceAdapterCreator,
  });

  return connection;
};

export const clearPlay = async (connection, musicQueue) => {
  if (connection) {
    musicQueue.length = 1;
  }
  return null;
};

export const voicePlay = async (connection, globalState) => {
  if (connection) {
    // player.on(AudioPlayerStatus.Idle, async () => {
    // console.log(AudioPlayerStatus);

    const ltg = globalState;

    if (ltg.musicQueue.length <= 0) {
      return null;
    }

    const info = await ytdl.getInfo(ltg.musicQueue[0]);
    const stream = ytdl(ltg.musicQueue[0], { filter: 'audioonly' });
    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });
    player.play(resource);
    connection.subscribe(player);
    player.on(AudioPlayerStatus.Idle, () => {
      console.log(ltg.musicQueue.length);
      if (ltg.musicQueue.length > 0) {
        console.log('shift');
        ltg.musicQueue.shift();
        console.log(`after shift${ltg.musicQueue.length}`);
        if (ltg.musicQueue.length > 0) {
          console.log('voicePlay');
          voicePlay(connection, ltg);
        } else {
          console.log('else voicePlay');
          connection.destroy();
          ltg.musicQueue = [];
        }
      } else {
        console.log('destroy');
        connection.destroy();
        ltg.musicQueue = [];
      }
    });
    return {
      title: info.videoDetails.title,
      description: info.videoDetails.description,
      thumbnail: info.videoDetails.thumbnails[2].url,
    };
    // });
  }
  return null;
};

export const skipPlay = async (connection, musicQueue) => {
  if (connection) {
    musicQueue.shift();
    if (musicQueue.length <= 0) {
      connection.destroy();
      // musicQueue = [];
    } else {
      return voicePlay(connection, musicQueue);
    }
  }
  return null;
};

export const voiceStop = (connection, musicQueue) => {
  const subscription = connection.subscribe(player);
  if (subscription) {
    setTimeout(() => {
      player.stop();
      subscription.unsubscribe();
      connection.destroy();
    }, 2_000);
  }
};
