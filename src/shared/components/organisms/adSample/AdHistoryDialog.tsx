import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material';
import useHandleAdHistory from 'shared/hooks/useHandleAdHistory';
import { ArrowDown2, Clock } from 'iconsax-react';
import lodash from 'lodash';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { normalizeKeys, normalizeValue } from 'shared/utils/normalizeKeys';

const IGNORE_KEYS = ['id', 'createdDate', 'modifiedDate', 'createdBy', 'deviceType', 'siteId', 'ssidId'];

const FIELD_LABELS: Record<string, string> = {
  templateName: 'name-template',
  adType: 'ad-type',
  timeStart: 'time-start',
  timeEnd: 'time-end',
  boD: 'birth-of-date',
  backgroundColor: 'bg-color',
  buttonColor: 'button-color',
  buttonText: 'button-content',
  destinationUrl: 'destination-url',
  appStoreUrl: 'apple-store-url',
  chPlayUrl: 'ch-play-url',
  videoUrl: 'videoUrl',
  logoImgUrl: 'logoImgUrl',
  bannerUrl: 'bannerUrl',
  imageUrl: 'imageUrl',
  imageTabletUrl: 'imageTabletUrl',
  imageDesktopUrl: 'imageDesktopUrl',
  maxLength: 'max-length',
  layoutNum: 'have-nav-footer',
  oneClick: 'one-touch',
  facebook: 'Facebook',
  google: 'Google'
};

interface PropTypes {
  open: boolean;
  onClose: () => void;
  adId: number;
  adName: string;
}

const AdHistoryDialog = ({ open, onClose, adId, adName }: PropTypes) => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const { adHistories, fetchAdHistory, loadingAdHistory } = useHandleAdHistory({ initQuery: { id: adId, page: 1, pageSize: 50 } });

  const intl = useIntl();

  useEffect(() => {
    if (open && adId) {
      fetchAdHistory();
    }
  }, [open, adId]);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const parseJsonData = (jsonString: string): any => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return {};
    }
  };

  const getChangedFields = (oldData: string, newData: string): Array<{ key: string; oldValue: any; newValue: any }> => {
    const oldObj = normalizeKeys(parseJsonData(oldData));
    const newObj = normalizeKeys(parseJsonData(newData));

    const changes: Array<{ key: string; oldValue: any; newValue: any }> = [];
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    allKeys.forEach((key) => {
      if (IGNORE_KEYS.includes(key)) return;

      const oldVal = normalizeValue(oldObj[key]);
      const newVal = normalizeValue(newObj[key]);

      if (!lodash.isEqual(oldVal, newVal)) {
        changes.push({
          key,
          oldValue: oldVal,
          newValue: newVal
        });
      }
    });

    return changes;
  };

  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string' && value === '') return '(trống)';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="p-8">
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: 'min-h-96'
        }}
      >
        <DialogTitle>{intl.formatMessage({ id: 'ad-history-title' })}</DialogTitle>

        <DialogContent className="!p-6">
          {loadingAdHistory ? (
            <Box color={'primary.main'} className="flex justify-center items-center py-20">
              <CircularProgress />
            </Box>
          ) : adHistories.length === 0 ? (
            <Box className="text-center py-20">
              <Typography variant="body1" className="">
                {intl.formatMessage({ id: 'no-data-available' })}
              </Typography>
            </Box>
          ) : (
            <Box className="space-y-4">
              {adHistories.map((item, index) => {
                const changes = getChangedFields(item.old_data, item.new_data);
                const panelId = `panel${item.id}`;
                return (
                  <Accordion
                    key={item.id}
                    expanded={expanded === panelId}
                    onChange={handleChange(panelId)}
                    className="shadow-md rounded-lg overflow-hidden"
                  >
                    <AccordionSummary expandIcon={<ArrowDown2 />} className=" border-l-4 border-blue-500 py-1">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <Chip label={`#${item.id}`} size="small" color="primary" variant="outlined" />
                          <div>
                            <Typography component={'span'} variant="subtitle1" color={'primary'}>
                              {item.created_by_fullname || item.created_by_username || 'Không xác định'}
                            </Typography>{' '}
                            thực hiện{' '}
                            <Typography variant="body1" component={'span'} className="font-semibold">
                              {item.description}
                            </Typography>
                          </div>
                          <Chip
                            label={changes.length > 0 ? `${changes.length} thay đổi` : 'Không có thay đổi'}
                            size="small"
                            color={changes.length > 0 ? 'warning' : 'default'}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-gray-600" />
                          <Typography variant="body1" color="text.secondary">
                            {formatDate(item.created_date)}
                          </Typography>
                        </div>
                      </div>
                    </AccordionSummary>

                    <AccordionDetails>
                      <div className="space-y-4">
                        {changes.length > 0 ? (
                          <div className="space-y-3">
                            <Typography variant="h6" className="font-semibold pb-2">
                              {intl.formatMessage({ id: 'change-details' })}:
                            </Typography>
                            {changes.map((change, idx) => (
                              <Box key={idx} className="rounded-lg p-4">
                                <Typography color={'primary.main'} variant="subtitle1" className="font-semibold  mb-2">
                                  {intl.formatMessage({ id: FIELD_LABELS[change.key] || change.key })}
                                </Typography>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-red-50 border border-red-200 rounded p-3">
                                    <Typography variant="body1" className="text-red-600 font-semibold block mb-1">
                                      {intl.formatMessage({ id: 'ad-history-old-value' })}:
                                    </Typography>
                                    <Typography variant="body1" className="text-red-800 font-mono text-xs break-words">
                                      {renderValue(change.oldValue)}
                                    </Typography>
                                  </div>
                                  <div className="bg-green-50 border border-green-200 rounded p-3">
                                    <Typography variant="body1" className="text-green-600 font-semibold block mb-1">
                                      {intl.formatMessage({ id: 'ad-history-new-value' })}:
                                    </Typography>
                                    <Typography variant="body1" className="text-green-800 font-mono text-xs break-words">
                                      {renderValue(change.newValue)}
                                    </Typography>
                                  </div>
                                </div>
                              </Box>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Typography variant="body2" className="text-gray-500">
                              {intl.formatMessage({ id: 'no-changes-detected' })}
                            </Typography>
                          </div>
                        )}
                      </div>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions className="p-6">
          <Button onClick={onClose} variant="contained" color="primary" className="px-6">
            {intl.formatMessage({ id: 'close' })}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdHistoryDialog;
