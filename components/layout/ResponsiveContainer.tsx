import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  SxProps,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type Props = {
  title: string;
  children: React.ReactNode;
  sx?: SxProps;
  contentWrapperSxNarrow?: SxProps;
  contentWrapperSxWide?: SxProps;
};

/**
 * A responsive container that displays a given title and content (via children) as
 * a heading and the content wrapped in a Paper component on wide viewports.
 *
 * Automatically turns them into an Accordion on narrow viewports.
 */
const ResponsiveContainer = ({
  title,
  children,
  sx,
  contentWrapperSxNarrow,
  contentWrapperSxWide,
}: Props) => {
  const theme = useTheme();
  const narrowViewport = useMediaQuery(theme.breakpoints.down('md'));

  return narrowViewport ? (
    <Accordion sx={sx}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          sx={{ maxHeight: 250, overflow: 'auto', ...contentWrapperSxNarrow }}
        >
          {children}
        </Box>
      </AccordionDetails>
    </Accordion>
  ) : (
    <Box sx={sx}>
      <Typography variant="h4" sx={{ mb: 1, ml: 1 }}>
        {title}
      </Typography>
      <Paper
        sx={{ maxHeight: '250px', overflow: 'auto', ...contentWrapperSxWide }}
      >
        {children}
      </Paper>
    </Box>
  );
};
export default ResponsiveContainer;
