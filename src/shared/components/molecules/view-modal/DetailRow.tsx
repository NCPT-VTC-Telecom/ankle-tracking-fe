import { Grid, Stack, Typography } from '@mui/material';
import { AttributesPropsDetailRow } from 'shared/types';

const DetailRow = ({ name, field, xs, md }: AttributesPropsDetailRow) => {
  return (
    <Grid item xs={xs || 12} md={md || 6}>
      <Stack spacing={0.5}>
        <Typography color="text.secondary">{name}</Typography>
        <Typography
          sx={{
            whiteSpace: 'normal',
            wordBreak: 'break-word'
          }}
        >
          {field}
        </Typography>
      </Stack>
    </Grid>
  );
};

export default DetailRow;
