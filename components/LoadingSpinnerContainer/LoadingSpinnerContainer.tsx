import { CircularProgress, Typography } from '@mui/material';
import { Box } from '@mui/system';

type Props = { height: number; message?: string };
const LoadingSpinnerContainer = ({ height, message }: Props) => {
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
        {message && <Typography>{message}</Typography>}
        <CircularProgress />
      </Box>
    </Box>
  );
};
export default LoadingSpinnerContainer;
