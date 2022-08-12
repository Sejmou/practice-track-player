import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type Props = { title: string; children: React.ReactNode };

/**
 * A responsive container that displays a given title and content (via children) as
 * a heading and the content wrapped in a Paper component on wide viewports.
 *
 * Automatically turns them into an Accordion on narrow viewports.
 */
const ResponsiveContainer = ({ title, children }: Props) => {
  const theme = useTheme();
  const narrowViewport = useMediaQuery(theme.breakpoints.down('md'));

  return narrowViewport ? (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ maxHeight: 250, overflow: 'auto' }}>{children}</Box>
      </AccordionDetails>
    </Accordion>
  ) : (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, ml: 1 }}>
        {title}
      </Typography>
      <Paper sx={{ maxHeight: '500px', overflow: 'auto' }}>{children}</Paper>
    </Box>
  );
};
export default ResponsiveContainer;
