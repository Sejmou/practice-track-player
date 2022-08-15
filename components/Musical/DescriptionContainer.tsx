import ResponsiveContainer from '@components/layout/ResponsiveContainer';
import SuspenseContainer from '@components/SuspenseContainer/SuspenseContainer';
import { useMusicalContext } from '@frontend/context/musical-context';
import { useYouTubeDescriptionFetcher } from '@frontend/hooks/use-audio-data-fetcher';
import { Button, Link, SxProps, Typography } from '@mui/material';
import { getSubstringAfterFirstSubstringOccurence } from '@util';
import moment from 'moment';
import { useMemo } from 'react';

type Props = { sx?: SxProps };

const DescriptionContainer = ({ sx }: Props) => {
  const { currentTrack: track, seekCurrentTrack } = useMusicalContext();
  const videoId = useMemo(() => {
    const videoUrlSearch = new URL(track.url).search;
    const params = new URLSearchParams(videoUrlSearch);
    return params.get('v')!;
  }, [track]);
  const { data: description, error: descriptionError } =
    useYouTubeDescriptionFetcher(videoId);

  const content = description
    ? description.split('\n').map((l, i) => {
        const timeStampData = extractTimeStamp(l);
        if (timeStampData) {
          const { timeStampString, seconds, restOfLine } = timeStampData;
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
      })
    : '';

  return (
    <ResponsiveContainer
      sx={sx}
      contentWrapperSxWide={{ px: 2, py: 1 }}
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
        {description ? (
          content
        ) : description === '' ? (
          <Typography>No description found.</Typography>
        ) : (
          <SuspenseContainer
            status={!descriptionError ? 'loading' : 'error'}
            errors={[descriptionError]}
          />
        )}
      </>
    </ResponsiveContainer>
  );
};
export default DescriptionContainer;

function extractTimeStamp(descriptionLine: string) {
  // remove whitespace at beginning and end of line, replace any repeated whitespace with single space
  const str = descriptionLine.trim().replaceAll(/\s+/g, ' ');
  const hmsDurationRegex = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)/;
  // regex that should match HH:MM:SS duration string: https://stackoverflow.com/a/8318367/13727176
  const match = str.match(hmsDurationRegex);
  if (match) {
    const timeStampString = match[0];
    return {
      timeStampString,
      seconds: moment.duration(timeStampString).asSeconds(),
      restOfLine: getSubstringAfterFirstSubstringOccurence(
        descriptionLine,
        timeStampString
      ),
    };
  }
}
