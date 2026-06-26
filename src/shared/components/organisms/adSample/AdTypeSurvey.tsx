import React from 'react';
import { TextField, Switch, FormControlLabel, Grid, InputAdornment, Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useIntl } from 'react-intl';
import { Typography } from '@mui/material';
import { Mobile, Monitor, SliderVertical } from 'iconsax-react';

interface Props {
  // onUpdate: (settings: FormValues) => void;
  uploadAssets: (type: 'img' | 'logo' | 'img_tablet' | 'img_desktop', file: File) => void;
  formik: any;
  setPreviewImage: (type: 'img' | 'logo' | 'img_tablet' | 'img_desktop', url: string) => void;
}
const AdTypeSurvey: React.FC<Props> = ({ uploadAssets, formik, setPreviewImage }) => {
  const intl = useIntl();

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

  return (
    <Grid container spacing={2} alignItems="center" sx={{ marginBottom: '25px' }}>
      <Grid item xs={12}>
        <Typography variant="h4">{intl.formatMessage({ id: 'survey-information' })}:</Typography>
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
      </Grid>
      <Grid item xs={6}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Typography sx={{ mr: 2, color: 'black', fontWeight: 'medium', minWidth: 90 }}>
            {intl.formatMessage({ id: 'fullname' })}:
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={formik.values.fullname === 'true' ? true : false}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  formik.setFieldValue('fullname', newValue.toString());
                }}
                name={'fullname-switch'}
              />
            }
            label={formik.values.fullname === 'true' ? 'Hiện' : 'Ẩn'}
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
          <Typography sx={{ mr: 2, color: 'black', fontWeight: 'medium', minWidth: 90 }}>
            {intl.formatMessage({ id: 'phone-number' })}:
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={formik.values.phoneNumber === 'true' ? true : false}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  formik.setFieldValue('phoneNumber', newValue.toString());
                }}
                name={'phoneNumber-switch'}
              />
            }
            label={formik.values.phoneNumber === 'true' ? 'Hiện' : 'Ẩn'}
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
          <Typography sx={{ mr: 2, color: 'black', fontWeight: 'medium', minWidth: 90 }}>{intl.formatMessage({ id: 'email' })}:</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={formik.values.email === 'true' ? true : false}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  formik.setFieldValue('email', newValue.toString());
                }}
                name={'email-switch'}
              />
            }
            label={formik.values.email === 'true' ? 'Hiện' : 'Ẩn'}
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
          <Typography sx={{ mr: 2, color: 'black', fontWeight: 'medium', minWidth: 90 }}>
            {intl.formatMessage({ id: 'birth-of-date' })}:
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={formik.values.BoD === 'true' ? true : false}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  formik.setFieldValue('BoD', newValue.toString());
                }}
                name={'BoD-switch'}
              />
            }
            label={formik.values.BoD === 'true' ? 'Hiện' : 'Ẩn'}
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
          <Typography sx={{ mr: 2, color: 'black', fontWeight: 'medium', minWidth: 90 }}>
            {intl.formatMessage({ id: 'gender' })}:
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={formik.values.gender === 'true' ? true : false}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  formik.setFieldValue('gender', newValue.toString());
                }}
                name={'gender-switch'}
              />
            }
            label={formik.values.gender === 'true' ? 'Hiện' : 'Ẩn'}
          />
        </Box>
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
        <Typography variant="h4">{intl.formatMessage({ id: 'image' })}:</Typography>
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
          type="file"
          name="img_tablet"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange('img_tablet', e)}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment sx={{ color: 'black' }} position="start">
                {intl.formatMessage({ id: 'upload-banner-tablet' })}:
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
          name="img_desktop"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange('img_desktop', e)}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment sx={{ color: 'black' }} position="start">
                {intl.formatMessage({ id: 'upload-banner-desktop' })}:
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
  );
};

export default AdTypeSurvey;
