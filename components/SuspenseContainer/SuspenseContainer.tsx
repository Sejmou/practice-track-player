import { CircularProgress, Typography } from '@mui/material';
import { Box } from '@mui/system';

type Props = {
  height: number;
  loadingMessage?: string;
  errorMessage: string;
  status: 'error' | 'loading';
};
const SuspenseContainer = ({
  height,
  status,
  errorMessage,
  loadingMessage,
}: Props) => {
  return (
    <Box
      sx={{
        height: `${height}px`,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {
          <Typography>
            {status === 'loading' ? loadingMessage : errorMessage}
          </Typography>
        }
        {status === 'loading' && <CircularProgress />}
      </Box>
    </Box>
  );
};
export default SuspenseContainer;
