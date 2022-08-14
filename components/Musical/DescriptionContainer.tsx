import ResponsiveContainer from '@components/layout/ResponsiveContainer';
import SuspenseContainer from '@components/SuspenseContainer/SuspenseContainer';
import { useMusicalContext } from '@frontend/context/musical-context';
import { useYouTubeDescriptionFetcher } from '@frontend/hooks/use-audio-data-fetcher';
import { Box, Link, SxProps, Typography } from '@mui/material';
import { useMemo } from 'react';

type Props = { sx?: SxProps };

const DescriptionContainer = ({ sx }: Props) => {
  const { currentTrack: track } = useMusicalContext();
  const videoId = useMemo(() => {
    const videoUrlSearch = new URL(track.url).search;
    const params = new URLSearchParams(videoUrlSearch);
    return params.get('v')!;
  }, [track]);
  const { data: description, error: descriptionError } =
    useYouTubeDescriptionFetcher(videoId);

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
          description?.split('\n').map((line, i) => (
            <Typography variant="body2" py={0.5} key={i}>
              {line}
            </Typography>
          ))
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
