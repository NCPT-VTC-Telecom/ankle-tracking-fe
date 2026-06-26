import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Box,
  TextField,
  // FormControlLabel,
  Typography,
  InputAdornment,
  // Switch,
  Grid,
  CardMedia,
  Skeleton,
  FormControlLabel,
  Switch,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import useHandleAds from 'shared/hooks/useHandleAds';
import { Mobile, Monitor, SliderVertical } from 'iconsax-react';
import { debounce } from 'lodash';
import { Stack } from '@mui/system';

interface Props {
  formik: any;
  // uploadAsset: (type: 'video' | 'logo' | 'banner', file: File) => void;
  setPreviewImage: (type: 'video' | 'logo' | 'banner', url: string) => void;
}

const AdTypeVideo: React.FC<Props> = ({ formik, setPreviewImage }) => {
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
    <Box sx={{ '& > :not(style)': { mb: 2 }, width: '100%' }}>
      <Stack
        direction={isMobile ? 'column' : 'row'} // Vertical on mobile, horizontal on desktop
        sx={{
          justifyContent: isMobile ? 'flex-start' : 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          mb: 2
        }}
      >
        <Typography variant="h3" sx={{ mb: isMobile ? 2 : 0 }}>
          {intl.formatMessage({ id: 'video-ad-settings' })}
        </Typography>
        <ToggleButtonGroup value={formik.values.deviceType} onChange={handleDeviceChange} aria-label="device" exclusive>
          <ToggleButton value="phone" aria-label="phone">
            <Mobile />
          </ToggleButton>
          <ToggleButton value="tablet" aria-label="tablet">
            <SliderVertical />
          </ToggleButton>
          <ToggleButton value="laptop" aria-label="laptop">
            <Monitor />
          </ToggleButton>
        </ToggleButtonGroup>

        {formik.values.videoUrl ? (
          <CardMedia
            component="video"
            src={videoUrl}
            controls
            autoPlay
            muted
            ref={videoRef}
            onLoadedMetadata={handleSetDurationVideo}
            style={{
              display: 'none',
              width: '100%',
              borderRadius: 4,
              border: '1px solid #ddd',
              height: 300,
              marginBottom: 20,
              marginTop: 10
            }}
          />
        ) : (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={300}
            animation={'wave'}
            style={{ display: 'none', borderRadius: 4, marginBottom: 20, marginTop: 10 }}
          />
        )}
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4">{intl.formatMessage({ id: 'general' })}:</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="file"
            name="video"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange('video', e)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment sx={{ color: 'black', minWidth: 94 }} position="start">
                  {intl.formatMessage({ id: 'upload-video' })}:
                </InputAdornment>
              )
            }}
            inputProps={{
              accept: 'video/*'
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="file"
            name="logo"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange('logo', e)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment sx={{ color: 'black', minWidth: 94 }} position="start">
                  {intl.formatMessage({ id: 'upload-logo' })}:
                </InputAdornment>
              )
            }}
            inputProps={{
              accept: 'image/*'
            }}
          />
        </Grid>
        {formik.values.adType === 'video2' && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="file"
              name="banner"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange('banner', e)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment sx={{ color: 'black' }} position="start">
                    {intl.formatMessage({ id: 'upload-banner' })}:
                  </InputAdornment>
                )
              }}
              inputProps={{
                accept: 'image/*'
              }}
            />
          </Grid>
        )}
        <Grid item xs={isMobile ? 12 : 6}>
          <TextField
            fullWidth
            name="nonSkip"
            variant="outlined"
            value={formik.values.nonSkip}
            onChange={formik.handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment sx={{ color: 'black' }} position="start">
                  {intl.formatMessage({ id: 'non-skip' })}:
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment sx={{ color: 'black' }} position="end">
                  {intl.formatMessage({ id: 'seconds' })}
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={isMobile ? 12 : 6}>
          <TextField
            fullWidth
            type="number"
            name="maxLength"
            value={formik.values.maxLength}
            onChange={formik.handleChange}
            variant="outlined"
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment sx={{ color: 'black' }} position="start">
                  {intl.formatMessage({ id: 'max-length' })}:
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment sx={{ color: 'black' }} position="end">
                  {intl.formatMessage({ id: 'seconds' })}
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="color"
            name="backgroundColor"
            value={formik.values.backgroundColor}
            onChange={formik.handleChange}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment sx={{ color: 'black' }} position="start">
                  {intl.formatMessage({ id: 'bg-color' })}:
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={isMobile ? 12 : 8}>
          <TextField
            fullWidth
            type="text"
            name="buttonText"
            value={formik.values.buttonText}
            onChange={formik.handleChange}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment sx={{ color: 'black' }} position="start">
                  {intl.formatMessage({ id: 'button-content' })}:
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={isMobile ? 12 : 4}>
          <TextField
            fullWidth
            type="color"
            name="buttonColor"
            value={formik.values.buttonColor}
            onChange={formik.handleChange}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment sx={{ color: 'black' }} position="start">
                  {intl.formatMessage({ id: 'button-color' })}:
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
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment sx={{ color: 'black' }} position="start">
                  {intl.formatMessage({ id: 'destination-url' })}:
                </InputAdornment>
              )
            }}
          />
        </Grid>

        {/* <Grid item xs={12}>
          <Typography variant="h4">{intl.formatMessage({ id: 'url-app' })}:</Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            name="appStoreUrl"
            value={formik.values.appStoreUrl}
            onChange={formik.handleChange}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment sx={{ color: 'black' }} position="start">
                  {intl.formatMessage({ id: 'apple-store-url' })}:
                </InputAdornment>
              )
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            name="chPlayUrl"
            value={formik.values.chPlayUrl}
            onChange={formik.handleChange}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment sx={{ color: 'black' }} position="start">
                  {intl.formatMessage({ id: 'ch-play-url' })}:
                </InputAdornment>
              )
            }}
          />
        </Grid> */}

        <Grid item xs={12}>
          <Typography variant="h4">{intl.formatMessage({ id: 'layout' })}:</Typography>
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Typography sx={{ mr: 2, color: 'black', fontWeight: 'medium', minWidth: 90 }}>
              {intl.formatMessage({ id: 'have-nav-footer' })}:
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.layoutNum === 1 ? true : false}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    formik.setFieldValue('layoutNum', newValue ? 1 : 2);
                  }}
                  name={'layoutNum-switch'}
                />
              }
              label={formik.values.layoutNum === 1 ? 'Hiện' : 'Ẩn'}
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h4">{intl.formatMessage({ id: 'authenticate' })}:</Typography>
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Typography sx={{ mr: 2, color: 'black', fontWeight: 'medium', minWidth: 90 }}>
              {intl.formatMessage({ id: 'one-touch' })}:
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.oneClick === 'true' ? true : false}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    formik.setFieldValue('oneClick', newValue.toString());
                  }}
                  name={'oneClick-switch'}
                />
              }
              label={formik.values.oneClick === 'true' ? 'Hiện' : 'Ẩn'}
            />
          </Box>
        </Grid>

        {formik.values.oneClick === 'false' && (
          <>
            <Grid item xs={12}>
              <Typography variant="h4">{intl.formatMessage({ id: 'platform' })}:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Typography sx={{ mr: 2, color: 'black', fontWeight: 'medium', minWidth: 90 }}>Facebook:</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.facebook === 'true' ? true : false}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        formik.setFieldValue('facebook', newValue.toString());
                      }}
                      name={'facebook-switch'}
                    />
                  }
                  label={formik.values.facebook === 'true' ? 'Hiện' : 'Ẩn'}
                />
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Typography sx={{ mr: 2, color: 'black', fontWeight: 'medium', minWidth: 90 }}>Google:</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.google === 'true' ? true : false}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        formik.setFieldValue('google', newValue.toString());
                      }}
                      name={'google-switch'}
                    />
                  }
                  label={formik.values.google === 'true' ? 'Hiện' : 'Ẩn'}
                />
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Typography sx={{ mr: 2, color: 'black', fontWeight: 'medium', minWidth: 90 }}>Twitter:</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      disabled
                      checked={formik.values.twitter === 'true' ? true : false}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        formik.setFieldValue('twitter', newValue.toString());
                      }}
                      name={'twitter-switch'}
                    />
                  }
                  label={formik.values.twitter === 'true' ? 'Hiện' : 'Ẩn'}
                />
              </Box>
            </Grid>
          </>
        )}
        <Grid item xs={12}>
          <Typography variant="h4">{intl.formatMessage({ id: 'analyst' })}:</Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            name="googleAnalyticsKey"
            value={formik.values.googleAnalyticsKey}
            onChange={formik.handleChange}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment sx={{ color: 'black' }} position="start">
                  {intl.formatMessage({ id: 'google-analytics-key' })}:
                </InputAdornment>
              )
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdTypeVideo;
