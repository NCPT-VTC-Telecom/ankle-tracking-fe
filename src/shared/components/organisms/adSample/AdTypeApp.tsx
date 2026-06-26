import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Box, Typography, Grid, TextField, InputAdornment, Switch, ToggleButtonGroup, ToggleButton, Stack } from '@mui/material';
import { FormControlLabel } from '@mui/material';
import { Monitor, SliderVertical, Mobile } from 'iconsax-react';
import { debounce } from 'lodash';

interface Props {
  uploadAsset: (type: 'img' | 'logo' | 'img_tablet' | 'img_desktop', file: File) => void;
  formik: any;
  setPreviewImage: (type: 'img' | 'logo' | 'img_tablet' | 'img_desktop', url: string) => void;
}

const AdTypeApp: React.FC<Props> = ({ formik, uploadAsset, setPreviewImage }) => {
  const intl = useIntl();
  const [isMobile, setIsMobile] = useState<boolean>(false); // New state for mobile detection

  const handleFileChange = (type: 'img' | 'logo' | 'img_tablet' | 'img_desktop', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file); // Tạo URL tạm thời
      setPreviewImage(type, previewUrl); // Cập nhật URL xem trước
      formik.setFieldValue(
        type === 'img' ? 'imageUrl' : type === 'img_tablet' ? 'imageTabletUrl' : type === 'img_desktop' ? 'imageDesktopUrl' : 'logoImgUrl',
        file
      ); // Chỉ lưu file vào formik
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
      <form onSubmit={formik.handleSubmit}>
        <Stack
          direction={isMobile ? 'column' : 'row'} // Vertical on mobile, horizontal on desktop
          sx={{
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h3" sx={{ marginBottom: 2, display: 'inline-block' }}>
            {intl.formatMessage({ id: 'ads-app-setting' })}
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
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4">{intl.formatMessage({ id: 'general' })}:</Typography>
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
                  <InputAdornment sx={{ color: 'black' }} position="start">
                    {intl.formatMessage({ id: 'upload-logo' })}:
                  </InputAdornment>
                )
              }}
              inputProps={{
                accept: 'image/*'
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="file"
              name="img"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange('img', e)}
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
          </Grid>

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
                    name={'social-switch'}
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
      </form>
    </Box>
  );
};

export default AdTypeApp;
