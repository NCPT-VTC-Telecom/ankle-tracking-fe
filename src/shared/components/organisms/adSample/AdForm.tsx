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
import { message, Upload, UploadProps } from 'antd';
import SectionCard from 'shared/components/molecules/card/SectionCard';
import CustomSwitch from 'shared/components/molecules/switch/CustomSwitch';
import useHandleAds from 'shared/hooks/useHandleAds';
import { Chart, ColorSwatch, Image, Link, Mobile, Monitor, Setting, SliderVertical, Text, VideoPlay } from 'iconsax-react';
import { debounce } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { AdType } from 'shared/types';

export type FileType = 'img' | 'logo' | 'img_tablet' | 'img_desktop' | 'video' | 'banner';

interface Props {
  adType: AdType;
  formik: any;
  setPreviewImage: (type: FileType, url: string) => void;
}

const fileTypeFieldMap: Record<FileType, string> = {
  video: 'videoUrl',
  logo: 'logoImgUrl',
  banner: 'bannerUrl',
  img: 'imageUrl',
  img_tablet: 'imageTabletUrl',
  img_desktop: 'imageDesktopUrl'
};

const AdForm: React.FC<Props> = React.memo(({ adType, formik, setPreviewImage }) => {
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

  const handleFileChange = (type: FileType, file: File | null) => {
    if (!file) {
      setPreviewImage(type, '');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(type, previewUrl);
    formik.setFieldValue(fileTypeFieldMap[type], file);
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

  const renderAdTitle = (adType: AdType) => {
    switch (adType) {
      case AdType.VIDEO:
        return intl.formatMessage({ id: 'video-ad-settings' });
      case AdType.VIDEO_BANNER:
        return intl.formatMessage({ id: 'video-ad-settings' });
      case AdType.APP:
        return intl.formatMessage({ id: 'ads-app-setting' });
      case AdType.BANNER:
        return intl.formatMessage({ id: 'banner-setting' });
      case AdType.SURVEY:
        return intl.formatMessage({ id: 'survey-information' });

      default:
        break;
    }
  };

  const handleCustomUpload = (fieldName: FileType, accept: string) => {
    const props: UploadProps = {
      name: fieldName,
      multiple: false,
      maxCount: 1,
      accept,
      customRequest: ({ file, onSuccess, onError }: any) => {
        setTimeout(() => {
          try {
            handleFileChange(fieldName, file as File);
            onSuccess?.({});
            message.success(`${fieldName} uploaded successfully`);
          } catch (error) {
            onError?.(error as Error);
            message.error(`${fieldName} upload failed`);
          } finally {
          }
        }, 1000);
      },
      onRemove: () => {
        handleFileChange(fieldName, null);
      },
      showUploadList: {
        showPreviewIcon: true,
        showRemoveIcon: true,
        showDownloadIcon: false
      },
      listType: 'picture-card' // hoặc "text", "picture"
    };

    return props;
  };

  return (
    <Box>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '12px',
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
            <Typography variant="h4" fontWeight="700">
              {renderAdTitle(adType)}
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
        {/* <Grid container spacing={3}>
          {(adType === AdType.VIDEO || adType === AdType.VIDEO_BANNER) && (
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
          )}

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

          {adType !== AdType.VIDEO && (
            <>
              {adType == AdType.VIDEO_BANNER ? (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="file"
                    name={'banner'}
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
              ) : (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="file"
                    name={'img'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange('img', e)}
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
            </>
          )}

          {(adType === AdType.BANNER || adType === AdType.SURVEY) && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="file"
                  name={'img_tablet'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange('img_tablet', e)}
                  inputProps={{ accept: 'image/*' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ color: 'primary.main' }}>
                            <Image size="18" />
                          </Box>
                          <Typography variant="body2" fontWeight="500" color="text.secondary">
                            {intl.formatMessage({ id: 'upload-banner-tablet' })}:
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
                  name={'img_desktop'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange('img_desktop', e)}
                  inputProps={{ accept: 'image/*' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ color: 'primary.main' }}>
                            <Image size="18" />
                          </Box>
                          <Typography variant="body2" fontWeight="500" color="text.secondary">
                            {intl.formatMessage({ id: 'upload-banner-desktop' })}:
                          </Typography>
                        </Stack>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </>
          )}
        </Grid> */}
        <Grid container spacing={3}>
          {/* Video Upload với preview */}
          {(adType === AdType.VIDEO || adType === AdType.VIDEO_BANNER) && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                {intl.formatMessage({ id: 'upload-video' })}
              </Typography>
              <Upload.Dragger {...handleCustomUpload('video', 'video/*')} style={{ padding: '12px' }}>
                <div className="ant-upload-drag-icon flex justify-center mb-2">
                  <Image style={{ fontSize: '48px', color: '#1890ff' }} />
                </div>
                <p className="ant-upload-text">Kéo thả video vào đây hoặc click để chọn</p>
                <p className="ant-upload-text">Hỗ trợ định dạng: MP4, AVI, MOV</p>
              </Upload.Dragger>
            </Grid>
          )}

          {/* Logo Upload với picture card */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              {intl.formatMessage({ id: 'upload-logo' })}
            </Typography>
            <Upload.Dragger {...handleCustomUpload('logo', 'image/*')} style={{ padding: '12px' }}>
              <div className="ant-upload-drag-icon flex justify-center mb-2">
                <Image style={{ fontSize: '48px', color: '#1890ff' }} />
              </div>
              <p className="ant-upload-text">Kéo thả hình ảnh vào đây hoặc click để chọn</p>
              <p className="ant-upload-text">Hỗ trợ định dạng: JPG, PNG, GIF, WEBP, SVG</p>
            </Upload.Dragger>
          </Grid>

          {/* Other uploads tương tự */}
          {adType !== AdType.VIDEO && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                {adType === AdType.VIDEO_BANNER ? intl.formatMessage({ id: 'upload-banner' }) : intl.formatMessage({ id: 'upload-banner' })}
              </Typography>
              <Upload.Dragger
                {...handleCustomUpload(adType === AdType.VIDEO_BANNER ? 'banner' : 'img', 'image/*')}
                style={{ padding: '12px' }}
              >
                <div className="ant-upload-drag-icon flex justify-center mb-2">
                  <Image style={{ fontSize: '48px', color: '#1890ff' }} />
                </div>
                <p className="ant-upload-text">Kéo thả hình ảnh vào đây hoặc click để chọn</p>
                <p className="ant-upload-text">Hỗ trợ định dạng: JPG, PNG, GIF, WEBP, SVG</p>
              </Upload.Dragger>
            </Grid>
          )}
          {(adType === AdType.BANNER || adType === AdType.SURVEY) && (
            <>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {intl.formatMessage({ id: 'upload-banner-tablet' })}
                </Typography>
                <Upload.Dragger {...handleCustomUpload('img_tablet', 'image/*')} style={{ padding: '12px' }}>
                  <div className="ant-upload-drag-icon flex justify-center mb-2">
                    <Image style={{ fontSize: '48px', color: '#1890ff' }} />
                  </div>
                  <p className="ant-upload-text">Kéo thả hình ảnh vào đây hoặc click để chọn</p>
                  <p className="ant-upload-text">Hỗ trợ định dạng: JPG, PNG, GIF, WEBP, SVG</p>
                </Upload.Dragger>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {intl.formatMessage({ id: 'upload-banner-desktop' })}
                </Typography>
                <Upload.Dragger {...handleCustomUpload('img_desktop', 'image/*')} style={{ padding: '12px' }}>
                  <div className="ant-upload-drag-icon flex justify-center mb-2">
                    <Image style={{ fontSize: '48px', color: '#1890ff' }} />
                  </div>
                  <p className="ant-upload-text">Kéo thả hình ảnh vào đây hoặc click để chọn</p>
                  <p className="ant-upload-text">Hỗ trợ định dạng: JPG, PNG, GIF, WEBP, SVG</p>
                </Upload.Dragger>
              </Grid>
            </>
          )}
        </Grid>
      </SectionCard>

      {/* Video Settings */}
      {(adType === AdType.VIDEO || adType === AdType.VIDEO_BANNER) && (
        <SectionCard title="Cài đặt Video" icon={<Setting size="20" />}>
          <Grid container spacing={3}>
            <Grid item xs={isMobile ? 12 : 6}>
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
      )}

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
        </Grid>
      </SectionCard>

      {/* Link Settings */}
      <SectionCard title="Đường dẫn" icon={<Link size="20" />}>
        <Grid container spacing={3}>
          {adType !== AdType.APP && (
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
          )}

          {adType == AdType.APP && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="text"
                  name="appStoreUrl"
                  value={formik.values.appStoreUrl}
                  onChange={formik.handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ color: 'primary.main' }}>
                            <Link size="18" />
                          </Box>
                          <Typography variant="body2" fontWeight="500" color="text.secondary">
                            {intl.formatMessage({ id: 'apple-store-url' })}:
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
                  name="chPlayUrl"
                  value={formik.values.chPlayUrl}
                  onChange={formik.handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ color: 'primary.main' }}>
                            <Link size="18" />
                          </Box>
                          <Typography variant="body2" fontWeight="500" color="text.secondary">
                            {intl.formatMessage({ id: 'ch-play-url' })}:
                          </Typography>
                        </Stack>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </SectionCard>

      {/* Layout Settings */}
      <SectionCard title={intl.formatMessage({ id: 'layout' })} icon={<Monitor size="20" />}>
        <Grid container spacing={2} alignItems="center" sx={{ marginBottom: '25px' }}>
          <Grid item xs={6}>
            <CustomSwitch
              sx={{ justifyContent: 'space-between' }}
              label={intl.formatMessage({ id: 'have-nav-footer' })}
              value={formik.values.layoutNum === 1}
              onChange={(checked) => formik.setFieldValue('layoutNum', checked ? 1 : 2)}
              name="layoutNum-switch"
            />
          </Grid>
          {adType == AdType.SURVEY && (
            <>
              <Grid item xs={6}>
                <CustomSwitch
                  sx={{ justifyContent: 'space-between' }}
                  label={intl.formatMessage({ id: 'fullname' })}
                  value={formik.values.fullname === 1}
                  onChange={(checked) => formik.setFieldValue('fullname', checked ? 1 : 2)}
                  name="fullname-switch"
                />
              </Grid>
              <Grid item xs={6}>
                <CustomSwitch
                  sx={{ justifyContent: 'space-between' }}
                  label={intl.formatMessage({ id: 'phone-number' })}
                  value={formik.values.phoneNumber === 1}
                  onChange={(checked) => formik.setFieldValue('phoneNumber', checked ? 1 : 2)}
                  name="phoneNumber-switch"
                />
              </Grid>
              <Grid item xs={6}>
                <CustomSwitch
                  sx={{ justifyContent: 'space-between' }}
                  label={intl.formatMessage({ id: 'email' })}
                  value={formik.values.email === 1}
                  onChange={(checked) => formik.setFieldValue('email', checked ? 1 : 2)}
                  name="email-switch"
                />
              </Grid>
              <Grid item xs={6}>
                <CustomSwitch
                  sx={{ justifyContent: 'space-between' }}
                  label={intl.formatMessage({ id: 'birth-of-date' })}
                  value={formik.values.BoD === 1}
                  onChange={(checked) => formik.setFieldValue('BoD', checked ? 1 : 2)}
                  name="BoD-switch"
                />
              </Grid>
              <Grid item xs={6}>
                <CustomSwitch
                  sx={{ justifyContent: 'space-between' }}
                  label={intl.formatMessage({ id: 'gender' })}
                  value={formik.values.gender === 1}
                  onChange={(checked) => formik.setFieldValue('gender', checked ? 1 : 2)}
                  name="gender-switch"
                />
              </Grid>
            </>
          )}
        </Grid>
      </SectionCard>

      {/* Authentication Settings */}
      <SectionCard title={intl.formatMessage({ id: 'authenticate' })} icon={<Setting size="20" />}>
        <div className="w-1/2 pr-2">
          <CustomSwitch
            sx={{ justifyContent: 'space-between' }}
            label={intl.formatMessage({ id: 'one-touch' })}
            value={formik.values.oneClick === 'true'}
            onChange={(checked) => formik.setFieldValue('oneClick', checked.toString())}
            name="oneClick-switch"
          />
        </div>

        {formik.values.oneClick === 'false' && (
          <>
            <div>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" color="text.primary">
                {intl.formatMessage({ id: 'platform' })}:
              </Typography>
            </div>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <CustomSwitch
                  sx={{ justifyContent: 'space-between' }}
                  label="Facebook"
                  value={formik.values.facebook === 'true'}
                  onChange={(checked) => formik.setFieldValue('facebook', checked.toString())}
                  name="facebook-switch"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomSwitch
                  sx={{ justifyContent: 'space-between' }}
                  label="Google"
                  value={formik.values.google === 'true'}
                  onChange={(checked) => formik.setFieldValue('google', checked.toString())}
                  name="google-switch"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomSwitch
                  sx={{ justifyContent: 'space-between' }}
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

export default AdForm;
