import {
  Box,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  // ListItemText,
  Typography,
  useTheme
} from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { DataDevice } from 'shared/types';

import { Grid } from '@mui/material';
import ChipStatus from 'shared/components/atoms/ChipStatus';
import { Edit } from 'iconsax-react';
import { FormattedMessage } from 'react-intl';
import { GlobalFilter } from 'shared/utils/react-table';

const SidebarList = ({
  devices,
  searchBox,
  loadMoreDevices,
  isLoading,
  selectedDevice,
  hasMore,
  onEditLocation
}: {
  devices: DataDevice[];
  searchBox: (content: string) => void;
  loadMoreDevices: () => void;
  isLoading: boolean;
  selectedDevice: (device: DataDevice) => void;
  hasMore: boolean;
  onEditLocation: (device: DataDevice) => void;
}) => {
  const observerRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();

  // Infinite Scroll: Quan sát phần tử cuối cùng trong danh sách
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          loadMoreDevices();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
    //eslint-disable-next-line
  }, [isLoading, hasMore]);

  return (
    <>
      <GlobalFilter searchFilter={searchBox} className="w-full mb-2" />
      {devices?.length > 0 ? (
        <List className="max-h-[calc(100vh-300px)] overflow-y-auto px-2">
          {devices.map((device, index) => (
            <React.Fragment key={device.id}>
              <ListItem
                button
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  mb: 2,
                  // boxShadow: 1,
                  ':hover': { backgroundColor: theme.palette.action.hover }
                }}
                onClick={() => {
                  selectedDevice(device);
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h5" component="div">
                      {/* {device.type === 'controller' ? device.name : device.model} */}
                      {device.name}
                    </Typography>
                    <div className="flex items-center gap-2">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent triggering onClick of ListItem
                          onEditLocation(device); // call your edit handler
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <ChipStatus
                        id={device.status_id}
                        successLabel="online"
                        errorLabel="offline"
                        warningLabel="pending"
                        dangerLabel="hearbeat_missed"
                        isolatedLabel="isolated"
                      />
                    </div>
                  </Box>

                  <Grid container spacing={1}>
                    <Grid item xs={12} display="flex">
                      <Typography variant="body1" color="textSecondary" sx={{ marginRight: '4px' }} component="span">
                        <FormattedMessage id="model" />:
                      </Typography>
                      <Typography variant="body1" color="textPrimary" component="span">
                        {device.model}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} display="flex">
                      <Typography variant="body1" color="textSecondary" sx={{ marginRight: '4px' }} component="span">
                        <FormattedMessage id="ip-address" />:
                      </Typography>
                      <Typography variant="body1" color="textPrimary" component="span">
                        {device.ip_address}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </ListItem>
              {/* <Divider /> */}
              {index === devices.length - 1 && hasMore && <div ref={observerRef} style={{ height: 1 }} />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <div
          className="justify-center text-gray-500 italic 
            h-[calc(100vh-300px)] flex items-center"
        >
          <FormattedMessage id="no-information-found" />
        </div>
      )}

      {isLoading && (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={30} />
        </Box>
      )}

      {/* Observer Target */}
      {/* {hasMore && <div ref={observerRef} style={{ height: '10px' }}></div>} */}
    </>
  );
};

export default SidebarList;
