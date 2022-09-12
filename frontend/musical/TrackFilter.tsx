import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  ListItem,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import { useMusicalContext } from './musical-context';

const TrackFilter = () => {
  const {
    trackFilterOptions,
    stagedTrackFilters,
    addTrackFilter,
    removeTrackFilter,
    applyFilters,
    resetFilters,
  } = useMusicalContext();

  return (
    <Paper
      sx={{
        display: 'grid',
        p: 1,
        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 128px',
        gridTemplateAreas: {
          xs: '"chips chips chips chips chips chips" "autocomplete autocomplete autocomplete autocomplete autocomplete buttons"',
          md: '"autocomplete chips chips chips chips buttons"',
        },
        alignItems: 'center',
      }}
    >
      <Autocomplete
        disablePortal
        size="small"
        sx={{
          width: '100%',
          gridArea: 'autocomplete',
        }}
        renderInput={params => <TextField {...params} label="Filter tracks" />}
        options={trackFilterOptions.filter(
          o => !stagedTrackFilters.find(a => o.label === a.label)
        )}
        isOptionEqualToValue={(option, value) => option.label === value.label}
        onChange={(_, value) => {
          if (value) {
            addTrackFilter(value);
          }
        }}
      />
      {stagedTrackFilters.length > 0 && (
        <Box
          sx={{
            gridArea: 'buttons',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}
        >
          <Box alignSelf="center">
            <Button onClick={applyFilters}>Apply</Button>
          </Box>
          <Box alignSelf="center">
            <Button onClick={resetFilters}>Reset</Button>
          </Box>
        </Box>
      )}
      <Stack
        px={0.5}
        m={0}
        sx={{ gridArea: 'chips' }}
        component="ul"
        direction="row"
        overflow="auto"
      >
        {stagedTrackFilters.map((f, i) => (
          <ListItem sx={{ py: 0, px: 0.5, width: 'min-content' }} key={i}>
            <Chip
              label={f.label}
              sx={{ mb: { xs: 2, md: 0 } }}
              onDelete={() => {
                removeTrackFilter(f);
                if (stagedTrackFilters.length === 1) resetFilters();
              }}
            />
          </ListItem>
        ))}
      </Stack>
    </Paper>
  );
};
export default TrackFilter;
