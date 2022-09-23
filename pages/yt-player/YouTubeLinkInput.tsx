import { ChangeEvent, FocusEvent, useCallback, useState } from 'react';
import { getURLVideoID } from 'ytdl-core';
import { Box, InputAdornment, SxProps, TextField } from '@mui/material';
import InsertLinkIcon from '@mui/icons-material/InsertLink';

import {
  YouTubePlaylistDataValidator,
  YouTubeVideoDataValidator,
} from '@models';
import { PlaylistVideoItemsData } from '.';

type Props = {
  onLinkDataChange: (newData: PlaylistVideoItemsData) => void;
  sx?: SxProps;
};

const YouTubeLinkInput = ({ onLinkDataChange, sx }: Props) => {
  const [linkInputTouched, setLinkInputTouched] = useState(false);
  const [videoLinkError, setVideoLinkError] = useState(false);

  const handleLinkInputChange = useCallback(
    async (
      ev: ChangeEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>
    ) => {
      const input = ev.target.value;
      const { videoId, playlistId, playlistIndex } = getYouTubeLinkData(input);
      const inputInvalid = !videoId && !playlistId;

      setVideoLinkError(inputInvalid);

      if (playlistId) {
        const playlistData = await fetch(
          `/api/yt/playlist-video-metadata/${playlistId}`
        )
          .then(res => res.json())
          .then(json => YouTubePlaylistDataValidator.parse(json));
        onLinkDataChange({
          videos: playlistData,
          initialIndex: playlistIndex ?? 0,
        });
      } else if (videoId) {
        const videoData = await fetch(`/api/yt/video-metadata/${videoId}`)
          .then(res => res.json())
          .then(json => YouTubeVideoDataValidator.parse(json));
        onLinkDataChange({ videos: [videoData], initialIndex: 0 });
      }
    },
    [onLinkDataChange]
  );

  const handleLinkBlur = useCallback(() => {
    setLinkInputTouched(true);
  }, []);

  return (
    <Box sx={sx}>
      <TextField
        label="Video/Playlist link"
        helperText={
          videoLinkError
            ? 'Please provide a valid YouTube playlist/video URL'
            : ''
        }
        id="outlined-start-adornment"
        sx={{ width: '100%' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <InsertLinkIcon />
            </InputAdornment>
          ),
          error: videoLinkError && linkInputTouched,
          spellCheck: false,
        }}
        onChange={handleLinkInputChange}
        onBlur={handleLinkBlur}
      />
    </Box>
  );
};
export default YouTubeLinkInput;

function getYouTubeLinkData(input: string) {
  let videoId;
  try {
    // make use of function used by ytdl-core
    videoId = getURLVideoID(input);
  } catch (error) {
    // continue in any case to also check if there is a playlist ID
  }
  const playlistId = getYouTubeQueryParam(input, 'list');
  const playlistIndex = Number(getYouTubeQueryParam(input, 'index'));
  return {
    videoId,
    playlistId,
    playlistIndex: isNaN(playlistIndex) ? undefined : playlistIndex - 1, // playlistIndex on YouTube is not zero-based
  };
}

//recycling code from ytdl-core
const validQueryDomains = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'gaming.youtube.com',
]);

/**
 * Extracts YouTube link query parameters other than video ID
 *
 * returns undefined if not a valid YouTube URL or param not found
 */
function getYouTubeQueryParam(link: string, paramName: string) {
  try {
    const parsed = new URL(link.trim());
    let paramValue = parsed.searchParams.get(paramName);
    if (parsed.hostname && !validQueryDomains.has(parsed.hostname)) {
      return;
    }
    if (!paramValue) {
      return;
    }
    return paramValue;
  } catch (error) {
    return;
  }
}
