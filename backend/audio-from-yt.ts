// adapted from https://stackoverflow.com/a/45375023/13727176
export async function fetchAudioFromYouTube(videoID: string) {
  const audioStreams = new Map<string, string>();

  const url =
    'https://images' +
    ~~(Math.random() * 33) +
    '-focus-opensocial.googleusercontent.com/gadgets/proxy?container=none&url=' +
    encodeURIComponent('https://www.youtube.com/watch?hl=en&v=' + videoID);

  console.log('URL', url);

  const response = await fetch(url);

  if (response.ok) {
    let data = await response.text();

    const regex =
      /(?:ytplayer\.config\s*=\s*|ytInitialPlayerResponse\s?=\s?)(.+?)(?:;var|;\(function|\)?;\s*if|;\s*if|;\s*ytplayer\.|;\s*<\/script)/gmsu;

    data = data.split('window.getPageData')[0];
    data = data.replace('ytInitialPlayerResponse = null', '');
    data = data.replace(
      'ytInitialPlayerResponse=window.ytInitialPlayerResponse',
      ''
    );
    data = data.replace(
      'ytplayer.config={args:{raw_player_response:ytInitialPlayerResponse}};',
      ''
    );

    const matches = regex.exec(data);
    console.log(matches);
    data = matches && matches.length > 1 ? JSON.parse(matches[1]) : false;
    console.log(data);
  }

  // let streams: any[] = [];

  // if (data.streamingData) {
  //   if (data.streamingData.adaptiveFormats) {
  //     streams = streams.concat(data.streamingData.adaptiveFormats);
  //   }

  //   if (data.streamingData.formats) {
  //     streams = streams.concat(data.streamingData.formats);
  //   }
  // } else {
  //   return false;
  // }

  // streams.forEach(function (stream, n) {
  //   const itag = stream.itag * 1;
  //   let quality = '';
  //   console.log(stream);
  //   switch (itag) {
  //     case 139:
  //       quality = '48kbps';
  //       break;
  //     case 140:
  //       quality = '128kbps';
  //       break;
  //     case 141:
  //       quality = '256kbps';
  //       break;
  //     case 249:
  //       quality = 'webm_l';
  //       break;
  //     case 250:
  //       quality = 'webm_m';
  //       break;
  //     case 251:
  //       quality = 'webm_h';
  //       break;
  //   }
  //   if (quality) audioStreams.set(quality, stream.url);
  // });

  // console.log(audioStreams);

  // const src =
  //   audioStreams.get('256kbps') ||
  //   audioStreams.get('128kbps') ||
  //   audioStreams.get('48kbps');

  // if (!src) {
  //   throw Error('Could not get audio stream for video!');
  // }
  // }
  else {
    throw Error('Could not get audio stream for video!');
  }
}
