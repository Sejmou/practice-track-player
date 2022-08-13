import ResponsiveContainer from '@components/layout/ResponsiveContainer';
import SuspenseContainer from '@components/SuspenseContainer/SuspenseContainer';
import { useMusicalContext } from '@frontend/context/musical-context';
import { useYouTubeDescriptionFetcher } from '@frontend/hooks/use-audio-data-fetcher';
import { SxProps, Typography } from '@mui/material';
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
    <ResponsiveContainer sx={sx} title="Current Track Description">
      {description ? (
        description?.split('\n').map((line, i, lines) => (
          <Typography
            sx={{
              px: 2,
              py: 1,
              pt: i == 0 ? 2 : null,
              pb: i == lines.length - 1 ? 2 : null,
            }}
            variant="body2"
            key={i}
          >
            {line}
          </Typography>
        ))
      ) : description === '' ? (
        <Typography
          sx={{
            p: 2,
          }}
        >
          No description found.
        </Typography>
      ) : (
        <SuspenseContainer
          status={!descriptionError ? 'loading' : 'error'}
          errors={[descriptionError]}
        />
      )}
    </ResponsiveContainer>
  );
};
export default DescriptionContainer;
