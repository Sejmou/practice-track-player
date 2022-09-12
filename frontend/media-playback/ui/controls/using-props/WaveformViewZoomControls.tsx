import { Box, IconButton, Stack, SxProps } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

type Props = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomInEnabled?: boolean;
  zoomOutEnabled?: boolean;
  sx?: SxProps;
};
const WaveformViewZoomControls = ({
  onZoomIn,
  onZoomOut,
  zoomInEnabled,
  zoomOutEnabled,
  sx,
}: Props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...sx,
      }}
    >
      <Stack direction="row">
        <IconButton
          color="primary"
          disabled={!zoomInEnabled}
          onClick={onZoomIn}
        >
          <ZoomInIcon />
        </IconButton>
        <IconButton
          color="primary"
          disabled={!zoomOutEnabled}
          onClick={onZoomOut}
        >
          <ZoomOutIcon />
        </IconButton>
      </Stack>
    </Box>
  );
};
export default WaveformViewZoomControls;
