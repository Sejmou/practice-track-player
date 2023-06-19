import { Link, SxProps, Typography } from '@mui/material';

import { useEffect, useMemo } from 'react';
import ResponsiveContainer from '@frontend/layout/ResponsiveContainer';
import SuspenseContainer from '@frontend/util/SuspenseContainer';
import { useMusicalContext } from '@frontend/musical/musical-context';
import { useYouTubeDescriptionFetcher } from '@frontend/media-playback/use-audio-data-fetcher';
import { MusicalSongTrackTimeStamp } from '@models';
import { extractTimestamp } from '@util';

type Props = { sx?: SxProps; contentWrapperSxWide?: SxProps };

const DescriptionContainer = ({ sx, contentWrapperSxWide }: Props) => {
  const {
    currentTrack: track,
    seekCurrentTrack,
    setCurrentTimeStamps,
  } = useMusicalContext();
  const videoId = useMemo(() => {
    const videoUrlSearch = new URL(track.url).search;
    const params = new URLSearchParams(videoUrlSearch);
    return params.get('v')!;
  }, [track]);
  const { data: description, error: descriptionError } =
    useYouTubeDescriptionFetcher(videoId);

  const { timeStamps, paragraphs } = useMemo(() => {
    const timeStamps: MusicalSongTrackTimeStamp[] = [];

    const paragraphs =
      description?.split('\n').map((l, i) => {
        const timeStampData = extractTimestamp(l);
        if (timeStampData) {
          const { timeStampString, seconds, restOfLine } = timeStampData;
          const firstLetterIdx = restOfLine.match('[a-zA-Z]')?.index; // https://stackoverflow.com/a/59575890/13727176

          timeStamps.push({
            time: seconds,
            labelText: firstLetterIdx
              ? restOfLine.substring(firstLetterIdx, restOfLine.length)
              : (timeStamps.length + 1).toString(),
          });
          return (
            <Typography variant="body2" py={0.5} key={i}>
              <Link
                sx={{
                  // need to add this by hand bc Link does not get this style without adding href for some reason
                  cursor: 'pointer',
                }}
                underline="none"
                onClick={() => seekCurrentTrack(seconds)}
              >
                {timeStampString}
              </Link>
              {restOfLine}
            </Typography>
          );
        } else {
          return (
            <Typography variant="body2" py={0.5} key={i}>
              {l}
            </Typography>
          );
        }
      }) || [];

    return { timeStamps, paragraphs };
  }, [description, seekCurrentTrack]);

  useEffect(() => {
    setCurrentTimeStamps(timeStamps);
  }, [setCurrentTimeStamps, timeStamps]);

  const errorMsg = !!descriptionError ? 'Could not load description :/' : '';

  return (
    <ResponsiveContainer
      sx={sx}
      contentWrapperSxWide={{ px: 2, py: 1, ...contentWrapperSxWide }}
      title="Current Track Description"
    >
      <>
        <Typography variant="caption">
          (from{' '}
          <Link href={track.url} target="_blank" underline="none">
            Practice Track video on YouTube
          </Link>
          )
        </Typography>
        {paragraphs.length > 0 ? (
          paragraphs
        ) : (
          <SuspenseContainer
            status={!descriptionError ? 'loading' : 'error'}
            errors={[errorMsg]}
          />
        )}
      </>
    </ResponsiveContainer>
  );
};
export default DescriptionContainer;
