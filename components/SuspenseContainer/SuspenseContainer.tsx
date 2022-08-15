import { Button, CircularProgress, Typography } from '@mui/material';
import { Box } from '@mui/system';

type Props = {
  height?: number | string;
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
        minHeight: '100px',
        height,
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
            {errors.length > 0
              ? errors.map((err, i) => {
                  if (typeof err !== 'string') return;
                  return <Typography key={i}>{err}</Typography>;
                })
              : ''}
            {fallbackActionButtonData && (
              <Button onClick={fallbackActionButtonData.action}>
                {fallbackActionButtonData.label}
              </Button>
            )}
          </>
        )}
        {status === 'loading' && <CircularProgress sx={{ height: '200px' }} />}
      </Box>
    </Box>
  );
};
export default SuspenseContainer;
