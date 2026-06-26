import { Collapse, Grid, Paper, TableCell, TableRow, Typography } from '@mui/material';
import { Box, useTheme } from '@mui/system';
import dayjs from 'dayjs';
import { Activity, Code1, Monitor } from 'iconsax-react';
import { Row } from 'react-table';
import { Log } from 'shared/types/log';

interface PropTypes {
  row: Row<Log>;
}

export const LogRowSub = ({ row }: PropTypes) => {
  const theme = useTheme();
  const data = row.original;

  const formatJSON = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  return (
    <TableRow>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
        <Collapse in={row.isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ margin: 2 }}>
            <Grid container spacing={2}>
              {/* Request Content */}
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Code1 size="20" color="#3B82F6" />
                    <Typography variant="h6">Request Content</Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#F3F4F6',
                      p: 2,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      height: '200px',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      resize: 'both'
                    }}
                  >
                    {formatJSON(data.request_content)}
                  </Box>
                </Paper>
              </Grid>

              {/* Response Content */}
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Activity size="20" color="#10B981" />
                    <Typography variant="h6">Response Content</Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#F3F4F6',
                      p: 2,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      height: '200px',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      resize: 'both',
                      maxWidth: '100%'
                    }}
                  >
                    {formatJSON(data.response_content)}
                  </Box>
                </Paper>
              </Grid>

              {/* User Agent */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Monitor size="20" color="#6B7280" />
                    <Typography variant="h6">User Agent</Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#F3F4F6',
                      p: 1,
                      borderRadius: 1
                    }}
                  >
                    {data.user_agent}
                  </Typography>
                </Paper>
              </Grid>

              {/* Additional Information */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6" mb={2}>
                    Additional Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Created Date
                      </Typography>
                      <Typography variant="body2">{dayjs(data.created_date).format('DD/MM/YYYY HH:mm:ss')}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Log ID
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace">
                        {data.id}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Old Data
                      </Typography>
                      <Typography variant="body2">{data.old_data || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        New Data
                      </Typography>
                      <Typography variant="body2">{data.new_data || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};
