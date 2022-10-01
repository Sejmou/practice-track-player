import ResponsiveContainer from '@frontend/layout/ResponsiveContainer';
import { usePlaybackStore } from '@frontend/media-playback/store';
import { secondsToTimeStr } from '@frontend/util/format-time';
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

type Props = {};
const Timestamps = (props: Props) => {
  const currentTime = usePlaybackStore(store => store.currentTime);
  const seekTo = usePlaybackStore(store => store.seekTo);
  const timestamps = usePlaybackStore(
    store => store.mediaElements[store.currIdx].timestamps
  );

  const currentTimestamp = useMemo(
    () =>
      timestamps.find(
        (t, i, arr) =>
          t.seconds <= currentTime &&
          (!arr[i + 1] || arr[i + 1].seconds > currentTime)
      ),
    [timestamps, currentTime]
  );

  const previousTimestamp = useMemo(
    () => timestamps[timestamps.findIndex(t => t === currentTimestamp) - 1],
    [timestamps, currentTimestamp]
  );

  const nextTimestamp = useMemo(
    () => timestamps[timestamps.findIndex(t => t === currentTimestamp) + 1],
    [timestamps, currentTimestamp]
  );

  if (timestamps.length === 0) return <></>;
  return (
    <Stack spacing={1}>
      {currentTimestamp && (
        <Stack
          spacing={1}
          direction="row"
          justifyContent="center"
          alignItems="center"
          component={Paper}
        >
          {previousTimestamp && (
            <Stack direction="row-reverse" alignItems="center" width="30%">
              <IconButton>
                <NavigateBeforeIcon
                  onClick={() => seekTo(previousTimestamp.seconds)}
                />
              </IconButton>
              <Typography
                variant="caption"
                color="gray"
                textOverflow="ellipsis"
                noWrap
                ml={2}
              >
                {previousTimestamp.label}
              </Typography>
            </Stack>
          )}
          <Box width="40%">
            <Typography textAlign="center" noWrap textOverflow="ellipsis">
              {currentTimestamp.label}
            </Typography>
          </Box>
          {nextTimestamp && (
            <Stack direction="row" alignItems="center" width="30%">
              <IconButton>
                <NavigateNextIcon
                  onClick={() => seekTo(nextTimestamp.seconds)}
                />
              </IconButton>
              <Typography
                variant="caption"
                color="gray"
                noWrap
                textOverflow="ellipsis"
                mr={2}
              >
                {nextTimestamp.label}
              </Typography>
            </Stack>
          )}
        </Stack>
      )}
      <ResponsiveContainer
        title="All Timestamps"
        contentWrapperSx={{ maxHeight: '300px' }}
      >
        <List dense>
          {timestamps.map((timestamp, i) => (
            <ListItemButton
              selected={timestamp === currentTimestamp}
              key={i}
              onClick={() => seekTo(timestamp.seconds)}
            >
              <ListItemText
                primary={timestamp.label}
                secondary={secondsToTimeStr(timestamp.seconds)}
              />
            </ListItemButton>
          ))}
        </List>
      </ResponsiveContainer>
    </Stack>
  );
};
export default Timestamps;
