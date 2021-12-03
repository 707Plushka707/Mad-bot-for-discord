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

export const voicePlay = async (connection, link) => {
  if (connection) {
    const info = await ytdl.getInfo(link);
    const stream = ytdl(link, { filter: 'audioonly' });
    const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
    player.play(resource);
    connection.subscribe(player);
    player.on(AudioPlayerStatus.Idle, () => connection.destroy());
    return {
      title: info.videoDetails.title,
    };
  }
  return null;
};

export const voiceStop = (connection) => {
  const subscription = connection.subscribe(player);
  if (subscription) {
    setTimeout(() => {
      player.stop();
      subscription.unsubscribe();
      connection.destroy();
    }, 2_000);
  }
};
