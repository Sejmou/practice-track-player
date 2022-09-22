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
  description?: string;
  children: React.ReactNode;
  sx?: SxProps;
  contentWrapperSx?: SxProps;
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
  description,
  children,
  sx,
  contentWrapperSx: contentWrapperSxProp,
  contentWrapperSxNarrow: contentWrapperSxNarrowProp,
  contentWrapperSxWide: contentWrapperSxWideProp,
}: Props) => {
  const theme = useTheme();
  const narrowViewport = useMediaQuery(theme.breakpoints.down('md'));

  const contentWrapperSx: SxProps = {
    maxHeight: { xs: '400px', md: '600px' },
    overflow: 'auto',
    ...(contentWrapperSxProp ?? {}),
  };

  const contentWrapperSxNarrow = {
    ...contentWrapperSx,
    ...(contentWrapperSxNarrowProp ?? {}),
  };

  const contentWrapperSxWide = {
    ...contentWrapperSx,
    ...(contentWrapperSxWideProp ?? {}),
  };

  return narrowViewport ? (
    <Accordion sx={sx}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={contentWrapperSxNarrow}>
          <>
            {description && (
              <Typography mb={1} variant="body2">
                {description}
              </Typography>
            )}
            {children}
          </>
        </Box>
      </AccordionDetails>
    </Accordion>
  ) : (
    <Box sx={sx}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {description && <Typography variant="body1">{description}</Typography>}
      <Paper sx={contentWrapperSxWide}>{children}</Paper>
    </Box>
  );
};
export default ResponsiveContainer;
