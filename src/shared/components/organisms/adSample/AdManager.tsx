import {
  Autocomplete,
  Box,
  Button,
  Card,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputLabel,
  Pagination,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import MainCard from 'shared/components/MainCard';
import useHandleAds from 'shared/hooks/useHandleAds';
import { Add, Clock, Edit2, Eye, MessageQuestion, ShieldTick, TickCircle, Trash } from 'iconsax-react';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { DataAds } from 'shared/types/Ads';
// import Form from 'shared/components/template/Form';
import { Dialog, useTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  // DatePicker
  TimePicker
} from 'antd';
import { adApi } from 'shared/api/ad.api';
import { authApi } from 'shared/api/auth.api';
import { PopupTransition } from 'shared/components/@extended/Transitions';
import ChipStatus from 'shared/components/atoms/ChipStatus';
import ConfirmationDialog from 'shared/components/template/ConfirmationDialog';
import { adFields } from 'shared/components/ul-config/form-config';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useAdsQuery } from 'shared/hooks/useHandleAdsV2';
import { useHandleSiteV2 } from 'shared/hooks/useHandleSitesV2';
import { ParamsGetSSID, useHandleSSIDV2 } from 'shared/hooks/useHandleSSIDV2';
import { usePermissionChecker } from 'shared/hooks/usePermissionChecker';
import useValidationSchemas from 'shared/hooks/useValidation';
import { debounce } from 'lodash';
import { enqueueSnackbar } from 'notistack';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { dispatch, RootState, useSelector } from 'shared/store';
import { setCurrentAds } from 'shared/store/reducers/auth';
import { SYSTEM_SITE_ID } from 'shared/utils/constant';
import { getOption } from 'shared/utils/handleData';
import GenericForm from '../GenericForm';
import { EmptyUserCard } from '../skeleton';
import AdHistoryDialog from './AdHistoryDialog';
const { RangePicker } = TimePicker;
interface AdMediaProps {
  ad: DataAds;
}

const initialValues = {
  templateName: '',
  adType: '',
  timeStart: null,
  timeEnd: null,
  placement: '',
  SSID: '',
  siteId: ''
};

export const optionAdType = [
  { label: 'Video', value: 'video1' },
  { label: 'Video & Banner', value: 'video2' },
  { label: 'Banner', value: 'banner' },
  { label: 'Survey', value: 'survey' },
  { label: 'Survey OTP', value: 'survey2' },
  { label: 'App', value: 'app' }
];

const AdMedia: React.FC<AdMediaProps> = ({ ad }) => {
  const assetUrl = ad.ad_type === 'video1' || ad.ad_type === 'video2' ? ad.video_url : ad.image_url;
  const { loadAssets } = useHandleAds();

  const { data: mediaUrl, isLoading } = useQuery({
    queryKey: ['asset', assetUrl],
    queryFn: async () => {
      if (!assetUrl) return null;
      return loadAssets(assetUrl);
    },
    enabled: !!assetUrl
  });

  if (isLoading || !mediaUrl) {
    return <Skeleton variant="rectangular" width="100%" height={200} animation="wave" style={{ borderRadius: 4 }} />;
  }

  switch (ad.ad_type) {
    case 'banner':
    case 'survey':
    case 'survey2':
      return <img src={mediaUrl} alt="Banner" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 4 }} />;
    case 'video1':
    case 'video2':
      return (
        <video style={{ width: '100%', height: 200, borderRadius: 4 }} controls autoPlay muted>
          <source src={mediaUrl} type="video/mp4" />
          <FormattedMessage id="browser-not-support-video-tag" />
        </video>
      );
    default:
      return <Skeleton variant="rectangular" width="100%" height={200} animation="wave" style={{ borderRadius: 4 }} />;
  }
};

const AdManager: React.FC = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  // const [adsAvailable, setAdsAvailable] = useState<DataAds[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [adsPerPage, setAdsPerPage] = useState(8);
  const [filters, setFilters] = useState<{ adType?: string; filters?: string; site?: string; ssid?: string; statusId?: number }>({});

  const { handleAddAds, handleDeleteAds } = useHandleAds();
  // const { fetchDataSSID } = useHandleSSID();
  const { AdSchema } = useValidationSchemas();
  const user = useSelector((state: RootState) => state.authSlice.user);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds ?? '');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<DataAds>();

  // const siteIdAccess = user?.sites?.map((item) => item.site_id);
  const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const navigate = useNavigate();
  const intl = useIntl();

  const { checkPermissionByAccess } = usePermissionChecker();

  const { canWrite } = checkPermissionByAccess('ads-management');
  const [openApprove, setOpenApprove] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [createdAd, setCreatedAd] = useState<DataAds>();

  // Tour guide states
  const [runTour, setRunTour] = useState(false);

  // Check if user has seen the tour before
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('adManagerTourCompleted');
    if (!hasSeenTour) {
      // Delay tour start to ensure DOM is ready
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Tour steps configuration
  const tourSteps: Step[] = useMemo(
    () => [
      {
        target: 'body',
        content: intl.formatMessage({ id: 'tour-ads-welcome-content' }),
        title: intl.formatMessage({ id: 'tour-ads-welcome-title' }),
        placement: 'center',
        disableBeacon: true
      },
      {
        target: '.tour-search-box',
        content: intl.formatMessage({ id: 'tour-ads-search-content' }),
        title: intl.formatMessage({ id: 'tour-ads-search-title' }),
        placement: 'bottom'
      },
      {
        target: '.tour-filter-type',
        content: intl.formatMessage({ id: 'tour-ads-filter-type-content' }),
        title: intl.formatMessage({ id: 'tour-ads-filter-type-title' }),
        placement: 'bottom'
      },
      {
        target: '.tour-filter-site',
        content: intl.formatMessage({ id: 'tour-ads-filter-site-content' }),
        title: intl.formatMessage({ id: 'tour-ads-filter-site-title' }),
        placement: 'bottom'
      },
      {
        target: '.tour-filter-ssid',
        content: intl.formatMessage({ id: 'tour-ads-filter-ssid-content' }),
        title: intl.formatMessage({ id: 'tour-ads-filter-ssid-title' }),
        placement: 'bottom'
      },
      {
        target: '.tour-filter-status',
        content: intl.formatMessage({ id: 'tour-ads-filter-status-content' }),
        title: intl.formatMessage({ id: 'tour-ads-filter-status-title' }),
        placement: 'bottom'
      },
      {
        target: '.tour-add-button',
        content: intl.formatMessage({ id: 'tour-ads-add-button-content' }),
        title: intl.formatMessage({ id: 'tour-ads-add-button-title' }),
        placement: 'bottom'
      },
      {
        target: '.tour-ad-card',
        content: intl.formatMessage({ id: 'tour-ads-card-content' }),
        title: intl.formatMessage({ id: 'tour-ads-card-title' }),
        placement: 'top'
      },
      {
        target: '.tour-ad-actions',
        content: intl.formatMessage({ id: 'tour-ads-actions-content' }),
        title: intl.formatMessage({ id: 'tour-ads-actions-title' }),
        placement: 'left'
      },
      {
        target: '.tour-pagination',
        content: intl.formatMessage({ id: 'tour-ads-pagination-content' }),
        title: intl.formatMessage({ id: 'tour-ads-pagination-title' }),
        placement: 'top'
      }
    ],
    [intl]
  );

  // Handle tour callback
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem('adManagerTourCompleted', 'true');
    }
  };

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      pageSize: adsPerPage,
      siteId: filters?.site === SYSTEM_SITE_ID ? '' : filters?.site || currentSite,
      ssid: filters?.ssid,
      filters: filters?.filters,
      adType: filters.adType,
      statusId: filters.statusId,
      adDataInput: JSON.stringify(currentAds)
    }),
    [currentPage, adsPerPage, currentSite, filters, currentAds]
  );

  const handleVerifyLogin = async () => {
    try {
      const res = await authApi.verify();

      dispatch(setCurrentAds({ adId: res.data.data?.ads.map((item: any) => item.ad_id) }));
    } catch (error) {}
  };

  const formik = useFormik({
    initialValues,
    validationSchema: AdSchema,
    onSubmit: async (value: any) => {
      const res = await handleAddAds(value);
      if (res && res.code === 0) {
        refreshAds();
        // fetchAdSettings(queryParams);
        setDialogOpen(false);
        setCreatedAd(res.data); // lưu ad vừa tạo
        setOpenConfirm(true); // mở popup hỏi người dùng
        handleVerifyLogin();
      }
    },
    enableReinitialize: true
  });

  const siteId = filters.site || formik.values.siteId;

  const paramsSSID: ParamsGetSSID = useMemo(
    () => ({
      page: 1,
      pageSize: 20,
      siteId: siteId === SYSTEM_SITE_ID ? '' : siteId,
      siteDataInput: JSON.stringify([siteId])
    }),
    [siteId]
  );

  console.log({ siteId });

  const { ads, totalPages, refreshAds,  } = useAdsQuery(queryParams);
  const { useSitesQuery } = useHandleSiteV2();

  const { ssid, isLoading: isLoadingSSID } = useHandleSSIDV2(paramsSSID, {
    enabled: !!siteId
  });

  const { data: siteData, isLoading: isLoadingSites } = useSitesQuery({
    page: 1,
    pageSize: 20,
    regionDataInput: JSON.stringify(regionIdAccess)
  });

  const handleApprove = async (record: DataAds) => {
    try {
      setIsLoadingApprove(true);
      const res = await adApi.approve({ id: record.id, statusId: 1 });
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'approve-success' }), { variant: 'success' });
        setOpenApprove(false);
        refreshAds();
        // fetchAdSettings(queryParams);
      }
    } finally {
      setIsLoadingApprove(false);
    }
  };

  const handleDelete = async (record: DataAds) => {
    try {
      setIsLoadingDelete(true);
      const res = await handleDeleteAds(record?.id, true);
      if (res.code === 0) {
        setIsLoadingDelete(false);
        refreshAds();
        // fetchAdSettings(queryParams);
        setOpenDelete(false);
      }
    } finally {
      setIsLoadingDelete(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.matchMedia('(min-width: 1920px)').matches) {
        setAdsPerPage(8);
      } else if (window.matchMedia('(min-width: 1500px)').matches) {
        setAdsPerPage(6);
      } else {
        setAdsPerPage(4);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Tạo optionSSID duy nhất
  const optionSSID = useMemo(() => {
    if (!ssid || ssid.length === 0) return [];
    const uniqueSSID = [...new Map(ssid.map((item) => [item.name, item])).values()];
    return getOption(uniqueSSID, 'name', 'name');
  }, [ssid]);

  // Tạo options tự động
  const optionSite = useMemo(() => {
    return siteData?.list ? getOption(siteData.list, 'name', 'id') : [];
  }, [siteData]);

  const fieldsWithOptions = useMemo(() => {
    return adFields.map((field) => {
      if (field.name === 'SSID') {
        return { ...field, options: optionSSID };
      }
      if (field.name === 'siteId') {
        return { ...field, options: optionSite };
      }
      return field;
    });
  }, [optionSSID, optionSite]);

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleCloseDialog = () => {
    setDialogOpen(!dialogOpen);
  };

  const handleViewHistory = async (ad: DataAds) => {
    try {
      setSelectedAd(ad);
      setHistoryOpen(true);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleSearchName = debounce((value: string) => {
    setFilters((prev) => ({ ...prev, filters: value }));
  }, 300);

  const handleConfirmNavigate = () => {
    if (createdAd) {
      const url = `/ads/ads-management/detail?adId=${createdAd.id}`;
      window.open(url, '_blank'); // mở tab mới
    }
    setOpenConfirm(false);
  };

  return (
    <>
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        scrollOffset={120}
        scrollToFirstStep
        disableScrolling={false}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: theme.palette.primary.main,
            zIndex: 10000,
            arrowColor: theme.palette.background.paper,
            backgroundColor: theme.palette.background.paper,
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            textColor: theme.palette.text.primary,
            width: 400
          },
          tooltip: {
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
            fontSize: 14,
            lineHeight: 1.6
          },
          tooltipContainer: {
            textAlign: 'left'
          },
          tooltipTitle: {
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 12,
            color: theme.palette.primary.main,
            lineHeight: 1.4
          },
          tooltipContent: {
            padding: '8px 0',
            fontSize: 14,
            color: theme.palette.text.secondary,
            lineHeight: 1.7
          },
          buttonNext: {
            backgroundColor: theme.palette.primary.main,
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 500,
            transition: 'all 0.2s ease',
            boxShadow: `0 2px 8px ${theme.palette.primary.main}40`
          },
          buttonBack: {
            color: theme.palette.text.secondary,
            marginRight: 8,
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 500
          },
          buttonSkip: {
            color: theme.palette.text.secondary,
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 8,
            padding: '10px 16px'
          },
          buttonClose: {
            top: "16px",
            right: "16px",
            width: 16,
            height: 16,
            padding: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          },
          spotlight: {
            borderRadius: 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 0, 0, 0.3)'
          },
          beacon: {
            borderRadius: '50%'
          },
          beaconInner: {
            backgroundColor: theme.palette.primary.main,
            borderRadius: '50%'
          },
          beaconOuter: {
            backgroundColor: `${theme.palette.primary.main}40`,
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: '50%'
          }
        }}
        locale={{
          back: intl.formatMessage({ id: 'tour-back' }),
          close: intl.formatMessage({ id: 'close' }),
          last: intl.formatMessage({ id: 'tour-finish' }),
          next: intl.formatMessage({ id: 'tour-next' }),
          skip: intl.formatMessage({ id: 'tour-skip' })
        }}
      />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <MainCard>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: `${matchDownSM ? 'flex-start' : 'center'}`,
                flexDirection: `${matchDownSM ? 'column' : 'row'}`
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexDirection: `${matchDownSM ? 'column' : 'row'}`,
                  gap: 2
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: `${matchDownSM ? 'flex-start' : 'center'}`,
                    flexDirection: `${matchDownSM ? 'column' : 'row'}`
                  }}
                >
                  <TextField
                    variant="outlined"
                    label={intl.formatMessage({ id: 'search-record' })}
                    onChange={(e) => handleSearchName(e.target.value)}
                    sx={{ minWidth: '200px' }}
                    className="w-full md:w-auto tour-search-box"
                    InputProps={{
                      sx: {
                        '& .MuiInputBase-input': {
                          padding: '10.5px'
                        }
                      }
                    }}
                  />
                  <Autocomplete
                    options={optionAdType}
                    sx={{ minWidth: '200px' }}
                    className="w-full md:w-auto tour-filter-type"
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => <TextField {...params} label={intl.formatMessage({ id: 'ad-type' })} variant="outlined" />}
                    value={optionAdType.find((o) => o.value === filters.adType) || null}
                    onChange={(event, value) => setFilters((prev) => ({ ...prev, adType: value?.value || '' }))}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                  />
                  <Autocomplete
                    loading={isLoadingSites}
                    options={optionSite}
                    sx={{ minWidth: '200px' }}
                    className="w-full md:w-auto tour-filter-site"
                    getOptionLabel={(option) => option.label as string}
                    renderInput={(params) => <TextField {...params} label={intl.formatMessage({ id: 'site' })} variant="outlined" />}
                    value={optionSite.find((o) => o.value === filters.site) || null} // controlled value
                    onChange={(_, value) => {
                      const newSite = value?.value ? String(value.value) : '';
                      setFilters((prev) => ({ ...prev, site: newSite, ssid: '' })); // reset ssid
                    }}
                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                  />
                  <Autocomplete
                    loading={isLoadingSSID}
                    disabled={!filters.site}
                    options={optionSSID}
                    sx={{ minWidth: '200px' }}
                    className="w-full md:w-auto tour-filter-ssid"
                    getOptionLabel={(option) => option.label as string}
                    renderInput={(params) => <TextField {...params} label={intl.formatMessage({ id: 'ssid' })} variant="outlined" />}
                    value={optionSSID.find((o) => o.value === filters.ssid) || null} // controlled value
                    onChange={(_, value) => setFilters((prev) => ({ ...prev, ssid: value?.value ? String(value.value) : '' }))}
                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                  />
                  <Autocomplete
                    options={[
                      { label: intl.formatMessage({ id: 'active' }), value: 1 },
                      { label: intl.formatMessage({ id: 'inactive' }), value: 2 },
                      { label: intl.formatMessage({ id: 'pending-approval' }), value: 3 }
                    ]}
                    sx={{ minWidth: '200px' }}
                    className="w-full md:w-auto tour-filter-status"
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => <TextField {...params} label={intl.formatMessage({ id: 'status' })} variant="outlined" />}
                    onChange={(event, value) => setFilters((prev) => ({ ...prev, statusId: value?.value }))}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>

                  <Button
                    className="h-10 tour-add-button"
                    disabled={!canWrite}
                    variant="contained"
                    startIcon={<Add />}
                    size="small"
                    onClick={handleCloseDialog}
                  >
                    <FormattedMessage id="add-ad" />
                  </Button>
                </Box>
              </Box>
            </Box>
          </MainCard>
        </Grid>
        <Grid item xs={12}>
          <MainCard>
            <Grid container spacing={3}>
              {ads.length > 0 ? (
                ads.map((ad, index) => (
                  <Grid item xs={12} xl={3} lg={4} key={index}>
                    <Card sx={{ boxShadow: theme.customShadows.z1 }} className={index === 0 ? 'tour-ad-card' : ''}>
                      <Box>
                        <AdMedia ad={ad} />
                      </Box>
                      <div className="p-5">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: 1 }}>
                          <Tooltip title={intl.formatMessage({ id: 'name-template' })}>
                            <div className="flex gap-1 flex-nowrap">
                              <Typography variant="h5" className="line-clamp-1">
                                {ad.template_name}
                              </Typography>
                            </div>
                          </Tooltip>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginY: '6px'
                          }}
                        >
                          <Typography variant="body1">SSID:</Typography>
                          <Typography variant="body1" className="font-bold">
                            {ad.ssid}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginY: '6px'
                          }}
                        >
                          <Typography variant="body1">
                            <FormattedMessage id="type-ads" />:
                          </Typography>
                          <Typography variant="body1" className="block font-bold">
                            {optionAdType.find((opt) => opt.value === ad.ad_type)?.label || ad.ad_type}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginY: '6px'
                          }}
                        >
                          <Typography variant="body1">
                            <FormattedMessage id="site" />:
                          </Typography>
                          <Typography variant="body1" className="font-bold">
                            {optionSite.find((item) => item.value == ad.site_id)?.label || '--'}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginY: '6px'
                          }}
                        >
                          <Typography variant="body1">
                            <FormattedMessage id="time" />:
                          </Typography>
                          <div className="">
                            <Typography variant="body1" className="font-bold">
                              {ad.time_start && ad.time_end
                                ? `${dayjs(ad.time_start, 'HH:mm:ss').format('HH:mm')} - ${dayjs(ad.time_end, 'HH:mm:ss').format('HH:mm')}`
                                : 'Chưa cập nhật'}
                            </Typography>
                          </div>
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginY: '6px'
                          }}
                        >
                          <Typography variant="body1">
                            <FormattedMessage id="status" />:
                          </Typography>
                          <div className="">
                            <ChipStatus id={ad.status_id} successLabel={'active'} errorLabel={'inactive'} warningLabel="pending-approval" />
                          </div>
                        </Box>
                        <div className="flex items-center gap-2 mt-5">
                          <div className="flex-1 min-w-0 flex items-center gap-2 justify-between">
                            <div className="w-full max-w-[150px]">
                              {ad?.status_id === 9 ? (
                                <Button
                                  sx={{ borderRadius: 3 }}
                                  fullWidth
                                  variant="contained"
                                  disabled={!canWrite}
                                  color="success"
                                  onClick={() => {
                                    setOpenApprove(true);
                                    setSelectedAd(ad);
                                  }}
                                >
                                  <FormattedMessage id="approve" />
                                </Button>
                              ) : (
                                <Button
                                  sx={{ borderRadius: 3 }}
                                  fullWidth
                                  variant="contained"
                                  disabled={!canWrite}
                                  color="primary"
                                  onClick={() => {
                                    navigate(`detail?adId=${ad.id}`);
                                  }}
                                >
                                  <FormattedMessage id="view-details" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <Box className="flex items-center tour-ad-actions">
                            <Tooltip title={intl.formatMessage({ id: 'change-history' })}>
                              <IconButton
                                color="secondary"
                                onClick={() => {
                                  // Mở modal hoặc dialog xem lịch sử log
                                  handleViewHistory(ad);
                                }}
                              >
                                <Clock />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={intl.formatMessage({ id: 'edit' })}>
                              <IconButton
                                color="warning"
                                onClick={() => {
                                  navigate(`detail?adId=${ad.id}`);
                                }}
                              >
                                {!canWrite ? <Eye /> : <Edit2 />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={intl.formatMessage({ id: 'delete' })}>
                              <IconButton
                                color="error"
                                onClick={() => {
                                  setOpenDelete(true);
                                  setSelectedAd(ad);
                                }}
                              >
                                <Trash />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </div>
                      </div>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <EmptyUserCard title="can-not-find-ads" />
                </Grid>
              )}
            </Grid>
            <Box sx={{ width:"fit-content", alignContent:"center", margin:"auto", display: 'flex', justifyContent: 'center', marginTop: 2 }} className="tour-pagination">
              <Pagination count={totalPages} page={currentPage} onChange={handleChangePage} color="primary" />
            </Box>
          </MainCard>
        </Grid>
      </Grid>
      <Dialog
        // fullScreen={matchDownSM}
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        onClose={handleCloseDialog}
        open={dialogOpen}
        aria-describedby="alert-dialog-slide-description"
      >
        <GenericForm
          title={intl.formatMessage({ id: 'add-ad' })}
          onCancel={handleCloseDialog}
          formik={formik}
          fields={fieldsWithOptions}
          isEditMode={false}
          children={
            <Grid item xs={12} md={12}>
              <Stack spacing={1.25}>
                <InputLabel>
                  {intl.formatMessage({ id: 'range-time' })}
                  <span className=" text-red-500 text-[16px]"> *</span>
                </InputLabel>

                <RangePicker
                  style={{ width: '100%', lineHeight: '24px', height: '50px', borderColor: '#BEC8D0' }}
                  format="HH:mm"
                  getPopupContainer={(triggerNode) => {
                    return triggerNode.parentNode instanceof HTMLElement ? triggerNode.parentNode : document.body; // Trả về document.body nếu parentNode không phải là HTMLElement
                  }}
                  value={[
                    formik.values.timeStart ? dayjs(formik.values.timeStart, 'HH:mm') : null,
                    formik.values.timeEnd ? dayjs(formik.values.timeEnd, 'HH:mm') : null
                  ]}
                  onChange={(times, timeStrings) => {
                    formik.setFieldValue('timeStart', timeStrings[0]);
                    formik.setFieldValue('timeEnd', timeStrings[1]);
                  }}
                  placeholder={[intl.formatMessage({ id: 'time-start' }), intl.formatMessage({ id: 'time-end' })]}
                />
              </Stack>
            </Grid>
          }
        />
      </Dialog>
      {selectedAd && (
        <AdHistoryDialog
          open={historyOpen}
          onClose={() => {
            setHistoryOpen(false);
            setSelectedAd(undefined);
          }}
          adId={selectedAd?.id}
          adName={''}
        />
      )}

      {selectedAd && openApprove && (
        <ConfirmationDialog
          showItemName
          itemName={selectedAd.template_name}
          open={openApprove}
          variant="success"
          titleKey={'alert-approve-advertisement'}
          description={'alert-approve-advertisement-desc'}
          confirmLabel="confirm"
          confirmButtonColor="success"
          isLoading={isLoadingApprove}
          onClose={() => setOpenApprove(false)}
          onConfirm={() => handleApprove(selectedAd)}
          icon={
            <Box
              sx={{
                width: 72,
                height: 72,
                bgcolor: '#e8f5e9',
                color: '#2e7d32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px'
              }}
            >
              <ShieldTick variant="Bold" size="36" color="currentColor" />
            </Box>
          }
        />
      )}

      {selectedAd && openDelete && (
        <ConfirmationDialog
          showItemName
          itemName={selectedAd.template_name}
          open={openDelete}
          variant="delete"
          titleKey={'alert-delete-ads'}
          description={'alert-delete'}
          confirmLabel="delete"
          confirmButtonColor="error"
          isLoading={isLoadingDelete}
          onClose={() => setOpenDelete(false)}
          onConfirm={() => handleDelete(selectedAd)}
        />
      )}

      {openConfirm && (
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>{intl.formatMessage({ id: 'ad-created-success' })}</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              {/* Icon minh họa */}
              <TickCircle size="80" color="#4caf50" variant="Bold" />
              {/* Nội dung */}
              <Typography align="center">{intl.formatMessage({ id: 'ad-setup-now-question' })}</Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)}>{intl.formatMessage({ id: 'cancel' })}</Button>
            <Button onClick={handleConfirmNavigate} variant="contained" color="primary">
              {intl.formatMessage({ id: 'agree' })}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {/* Floating Tour Guide Button */}
      <Tooltip title={intl.formatMessage({ id: 'tour-start' })} placement="left">
        <IconButton
          onClick={() => setRunTour(true)}
          sx={{
            borderRadius: 999,
            position: 'fixed',
            bottom: 30,
            right: 30,
            zIndex: 9999,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': {
                boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.7)'
              },
              '70%': {
                boxShadow: '0 0 0 15px rgba(33, 150, 243, 0)'
              },
              '100%': {
                boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)'
            }
            },
            '&:hover': {
              backgroundColor: '#1976d2',
              transform: 'scale(1.1)',
              transition: 'all 0.3s ease'
            }
          }}
        >
          <MessageQuestion size="32" variant="Bold" />
        </IconButton>
      </Tooltip>
    </>
  );
};

export default AdManager;
