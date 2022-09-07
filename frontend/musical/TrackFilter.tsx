import {
  Autocomplete,
  Box,
  Button,
  Chip,
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
    <Stack direction="row" component={Paper}>
      <Autocomplete
        disablePortal
        size="small"
        sx={{ width: 300, p: 1 }}
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
      <Stack p={0} m={0} component="ul" direction="row">
        {stagedTrackFilters.map((f, i) => (
          <ListItem sx={{ p: 1 }} key={i}>
            <Chip
              label={f.label}
              onDelete={() => {
                removeTrackFilter(f);
                if (stagedTrackFilters.length === 1) resetFilters();
              }}
            />
          </ListItem>
        ))}
      </Stack>
      {stagedTrackFilters.length > 0 && (
        <>
          <Box alignSelf="center">
            <Button onClick={applyFilters}>Apply</Button>
          </Box>
          <Box alignSelf="center">
            <Button onClick={resetFilters}>Reset</Button>
          </Box>
        </>
      )}
    </Stack>
  );
};
export default TrackFilter;
