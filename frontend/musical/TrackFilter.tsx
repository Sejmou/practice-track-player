import { Autocomplete, Chip, ListItem, Stack, TextField } from '@mui/material';
import { useRef } from 'react';
import { useMusicalContext } from './musical-context';

const TrackFilter = () => {
  const {
    trackFilterOptions,
    appliedTrackFilters,
    addTrackFilter,
    removeTrackFilter,
  } = useMusicalContext();

  const autoCompleteInputRef = useRef<any>();

  console.log(appliedTrackFilters);
  return (
    <Stack direction="row">
      <Autocomplete
        disablePortal
        size="small"
        sx={{ width: 300, p: 1 }}
        renderInput={params => <TextField {...params} label="Filter tracks" />}
        options={trackFilterOptions.filter(
          o => !appliedTrackFilters.find(a => o.label === a.label)
        )}
        isOptionEqualToValue={(option, value) => option.label === value.label}
        onChange={(_, value) => {
          if (value) {
            addTrackFilter(value);
          }
        }}
      />
      <Stack p={0} m={0} component="ul" direction="row">
        {appliedTrackFilters.map((f, i) => (
          <ListItem sx={{ p: 1 }} key={i}>
            <Chip label={f.label} onDelete={() => removeTrackFilter(f)} />
          </ListItem>
        ))}
      </Stack>
    </Stack>
  );
};
export default TrackFilter;
