import { Button, CircularProgress, Typography } from '@mui/material';
import { Box } from '@mui/system';

type Props = {
  height: number;
  loadingMessage?: string;
  errors: string[];
  status: 'error' | 'loading';
  /**
   * If provided, a button is displayed under the error messages.
   *
   * On click, the fallback action function is executed
   */
  fallbackActionButtonData?: {
    label: string;
    action: () => void;
  };
};
const SuspenseContainer = ({
  height,
  status,
  errors,
  loadingMessage,
  fallbackActionButtonData,
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
        {status == 'loading' ? (
          <Typography>{loadingMessage}</Typography>
        ) : (
          <>
            {errors.map((err, i) => (
              <Typography key={i}>{err}</Typography>
            ))}
            {fallbackActionButtonData && (
              <Button onClick={fallbackActionButtonData.action}>
                {fallbackActionButtonData.label}
              </Button>
            )}
          </>
        )}
        {status === 'loading' && <CircularProgress />}
      </Box>
    </Box>
  );
};
export default SuspenseContainer;
