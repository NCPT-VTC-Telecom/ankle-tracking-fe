import {
  Box,
  CardMedia,
  Divider,
  Grid,
  InputAdornment,
  Paper,
  Skeleton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { Stack } from '@mui/system';
import SectionCard from 'shared/components/molecules/card/SectionCard';
import CustomSwitch from 'shared/components/molecules/switch/CustomSwitch';
import useHandleAds from 'shared/hooks/useHandleAds';
import { Chart, ColorSwatch, Image, Link, Mobile, Monitor, Setting, SliderVertical, Text, VideoPlay } from 'iconsax-react';
import { debounce } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

interface Props {
  formik: any;
  setPreviewImage: (type: 'video' | 'logo' | 'banner', url: string) => void;
}

const AdTypeVideoV2: React.FC<Props> = React.memo(({ formik, setPreviewImage }) => {
  const intl = useIntl();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const { loadAssets } = useHandleAds();

  const loadImg = async (videoUrl: string) => {
    const url = await loadAssets(videoUrl);
    if (url) {
      setVideoUrl(url);
    }
  };


  const handleSetDurationVideo = () => {
    const videoElement = videoRef.current;

    if (videoElement && videoElement.duration) {
      formik.setFieldValue('maxLength', videoElement.duration.toFixed(2));
    }
  };

  useEffect(() => {
    loadImg(formik.values.videoUrl);
    //eslint-disable-next-line
  }, [formik.values.videoUrl]);

  const handleFileChange = (type: 'video' | 'logo' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file); // Tạo URL tạm thời
      setPreviewImage(type, previewUrl); // Cập nhật URL xem trước
      formik.setFieldValue(type === 'video' ? 'videoUrl' : type === 'logo' ? 'logoImgUrl' : 'bannerUrl', file); // Chỉ lưu file vào formik
    }
  };

  const handleDeviceChange = (event: React.MouseEvent<HTMLElement>, newDevice: string) => {
    if (newDevice) {
      formik.setFieldValue('deviceType', newDevice);
    }
  };

  useEffect(() => {
    const updateDeviceType = debounce(() => {
      const screenWidth = window.innerWidth;
      const tabletBreakpoint = 1024;
      setIsMobile(screenWidth < tabletBreakpoint);
    }, 200);

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => {
      window.removeEventListener('resize', updateDeviceType);
      updateDeviceType.cancel();
    };
  }, []);

  return (
    <Box>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Stack
          direction={isMobile ? 'column' : 'row'}
          justifyContent="space-between"
          alignItems={isMobile ? 'flex-start' : 'center'}
          spacing={3}
        >
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
              {intl.formatMessage({ id: 'video-ad-settings' })}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Cấu hình quảng cáo video của bạn
            </Typography>
          </Box>

          <ToggleButtonGroup
            value={formik.values.deviceType}
            onChange={handleDeviceChange}
            exclusive
            sx={{
              bgcolor: 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              '& .MuiToggleButton-root': {
                color: 'white',
                border: 'none',
                '&.Mui-selected': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  }
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }
            }}
          >
            <ToggleButton value="phone">
              <Mobile size="20" />
            </ToggleButton>
            <ToggleButton value="tablet">
              <SliderVertical size="20" />
            </ToggleButton>
            <ToggleButton value="laptop">
              <Monitor size="20" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Paper>

      {/* Hidden Video Player */}
      {formik.values.videoUrl ? (
        <CardMedia
          component="video"
          src={videoUrl}
          controls
          autoPlay
          muted
          ref={videoRef}
          onLoadedMetadata={handleSetDurationVideo}
          style={{ display: 'none' }}
        />
      ) : (
        <Skeleton variant="rectangular" style={{ display: 'none' }} />
      )}

      {/* Media Upload Section */}
      <SectionCard title={intl.formatMessage({ id: 'general' })} icon={<VideoPlay size="20" />}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="file"
              name="video"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange('video', e)}
              inputProps={{ accept: 'video/*' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ color: 'primary.main' }}>
                        <VideoPlay size="18" />
                      </Box>
                      <Typography variant="body2" fontWeight="500" color="text.secondary">
                        {intl.formatMessage({ id: 'upload-video' })}:
                      </Typography>
                    </Stack>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="file"
              name="logo"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange('logo', e)}
              inputProps={{ accept: 'image/*' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ color: 'primary.main' }}>
                        <Image size="18" />
                      </Box>
                      <Typography variant="body2" fontWeight="500" color="text.secondary">
                        {intl.formatMessage({ id: 'upload-logo' })}:
                      </Typography>
                    </Stack>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          {formik.values.adType === 'video2' && (
            <Grid item xs={12}>
              <TextField
                type="file"
                name="banner"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange('banner', e)}
                inputProps={{ accept: 'image/*' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ color: 'primary.main' }}>
                          <Image size="18" />
                        </Box>
                        <Typography variant="body2" fontWeight="500" color="text.secondary">
                          {intl.formatMessage({ id: 'upload-banner' })}:
                        </Typography>
                      </Stack>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          )}
        </Grid>
      </SectionCard>

      {/* Video Settings */}
      <SectionCard title="Cài đặt Video" icon={<Setting size="20" />}>
        <Grid container spacing={3}>
          <Grid item xs={isMobile ? 12 : 6}>
            {/* <TextField
              label={intl.formatMessage({ id: 'non-skip' })}
              name="nonSkip"
              value={formik.values.nonSkip}
              onChange={formik.handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="text.secondary">
                      {intl.formatMessage({ id: 'seconds' })}
                    </Typography>
                  </InputAdornment>
                )
              }}
            /> */}
            <TextField
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="text.secondary">
                      {intl.formatMessage({ id: 'non-skip' })}
                    </Typography>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="text.secondary">
                      {intl.formatMessage({ id: 'seconds' })}
                    </Typography>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={isMobile ? 12 : 6}>
            <TextField
              type="number"
              name="maxLength"
              value={formik.values.maxLength}
              onChange={formik.handleChange}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="text.secondary">
                      {intl.formatMessage({ id: 'max-length' })}
                    </Typography>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="text.secondary">
                      {intl.formatMessage({ id: 'seconds' })}
                    </Typography>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>
      </SectionCard>

      {/* Design Settings */}
      <SectionCard title="Thiết kế" icon={<ColorSwatch size="20" />}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="color"
              name="backgroundColor"
              value={formik.values.backgroundColor}
              onChange={formik.handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ color: 'primary.main' }}>{<ColorSwatch size="18" />}</Box>
                      <Typography variant="body2" fontWeight="500" color="text.secondary">
                        {intl.formatMessage({ id: 'bg-color' })}:
                      </Typography>
                    </Stack>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="color"
              name="buttonColor"
              value={formik.values.buttonColor}
              onChange={formik.handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ color: 'primary.main' }}>
                        <ColorSwatch size="18" />
                      </Box>
                      <Typography variant="body2" fontWeight="500" color="text.secondary">
                        {intl.formatMessage({ id: 'button-color' })}:
                      </Typography>
                    </Stack>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="text"
              name="buttonText"
              value={formik.values.buttonText}
              onChange={formik.handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ color: 'primary.main' }}>{<Text size="18" />}</Box>
                      <Typography variant="body2" fontWeight="500" color="text.secondary">
                        {intl.formatMessage({ id: 'button-content' })}:
                      </Typography>
                    </Stack>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="text"
              name="destinationUrl"
              value={formik.values.destinationUrl}
              onChange={formik.handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ color: 'primary.main' }}>
                        <Link size="18" />
                      </Box>
                      <Typography variant="body2" fontWeight="500" color="text.secondary">
                        {intl.formatMessage({ id: 'destination-url' })}:
                      </Typography>
                    </Stack>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>
      </SectionCard>

      {/* Layout Settings */}
      <SectionCard title={intl.formatMessage({ id: 'layout' })} icon={<Monitor size="20" />}>
        <CustomSwitch
          label={intl.formatMessage({ id: 'have-nav-footer' })}
          value={formik.values.layoutNum === 1}
          onChange={(checked) => formik.setFieldValue('layoutNum', checked ? 1 : 2)}
          name="layoutNum-switch"
        />
      </SectionCard>

      {/* Authentication Settings */}
      <SectionCard title={intl.formatMessage({ id: 'authenticate' })} icon={<Setting size="20" />}>
        <Stack spacing={2}>
          <CustomSwitch
            label={intl.formatMessage({ id: 'one-touch' })}
            value={formik.values.oneClick === 'true'}
            onChange={(checked) => formik.setFieldValue('oneClick', checked.toString())}
            name="oneClick-switch"
          />

          {formik.values.oneClick === 'false' && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
                {intl.formatMessage({ id: 'platform' })}:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <CustomSwitch
                    label="Facebook"
                    value={formik.values.facebook === 'true'}
                    onChange={(checked) => formik.setFieldValue('facebook', checked.toString())}
                    name="facebook-switch"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomSwitch
                    label="Google"
                    value={formik.values.google === 'true'}
                    onChange={(checked) => formik.setFieldValue('google', checked.toString())}
                    name="google-switch"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomSwitch
                    label="Twitter"
                    value={formik.values.twitter === 'true'}
                    onChange={(checked) => formik.setFieldValue('twitter', checked.toString())}
                    name="twitter-switch"
                    disabled
                  />
                </Grid>
              </Grid>
            </>
          )}
        </Stack>
      </SectionCard>

      {/* Analytics */}
      <SectionCard title={intl.formatMessage({ id: 'analyst' })} icon={<Chart size="20" />}>
        <TextField
          fullWidth
          name="googleAnalyticsKey"
          value={formik.values.googleAnalyticsKey}
          onChange={formik.handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ color: 'primary.main' }}>
                    <Chart size="18" />
                  </Box>
                  <Typography variant="body2" fontWeight="500" color="text.secondary">
                    {intl.formatMessage({ id: 'google-analytics-key' })}:
                  </Typography>
                </Stack>
              </InputAdornment>
            )
          }}
        />
      </SectionCard>
    </Box>
  );
});

export default AdTypeVideoV2;
