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
import { message, Upload, UploadFile, UploadProps } from 'antd';
import SectionCard from 'shared/components/molecules/card/SectionCard';
import CustomSwitch from 'shared/components/molecules/switch/CustomSwitch';
import { FormikProvider } from 'formik';
import useHandleAds from 'shared/hooks/useHandleAds';
import { Call, Chart, ColorSwatch, Image, Link, Message, Mobile, Monitor, Setting, SliderVertical, Text, VideoPlay } from 'iconsax-react';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { AdType } from 'shared/types';
import { UrlAccess } from './AdPreview.js';
import OptionalQuestionSection from './OptionalQuestionSection.tsx';

export type FileType = 'img' | 'logo' | 'img_tablet' | 'img_desktop' | 'video' | 'banner';

interface Props {
  adType: AdType;
  formik: any;
  onFileChange: (type: FileType, url: string) => void;
  previewImages: any;
}

const fileTypeFieldMap: Record<FileType, string> = {
  video: 'videoUrl',
  logo: 'logoImgUrl',
  banner: 'bannerUrl',
  img: 'imageUrl',
  img_tablet: 'imageTabletUrl',
  img_desktop: 'imageDesktopUrl'
};

const AdsForm: React.FC<Props> = React.memo(({ adType, formik, onFileChange, previewImages }) => {
  const intl = useIntl();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [urlAssets, setUrlAssets] = useState<UrlAccess>({
    imgUrl: '',
    imgTabletUrl: '',
    imgDesktopUrl: '',
    bannerUrl: '',
    logoUrl: '',
    videoUrl: ''
  });

  const [fileLists, setFileLists] = useState<Record<string, UploadFile[]>>({});

  useEffect(() => {
    setFileLists({
      logo: urlAssets.logoUrl
        ? [
            {
              uid: '-1',
              name: 'logo.png',
              status: 'done',
              url: urlAssets.logoUrl
            }
          ]
        : [],
      banner: urlAssets.bannerUrl
        ? [
            {
              uid: '-2',
              name: 'banner.png',
              status: 'done',
              url: urlAssets.bannerUrl
            }
          ]
        : [],
      img: urlAssets.imgUrl
        ? [
            {
              uid: '-3',
              name: 'image.png',
              status: 'done',
              url: urlAssets.imgUrl
            }
          ]
        : [],
      img_tablet: urlAssets.imgTabletUrl
        ? [
            {
              uid: '-4',
              name: 'image.png',
              status: 'done',
              url: urlAssets.imgTabletUrl
            }
          ]
        : [],
      img_desktop: urlAssets.imgDesktopUrl
        ? [
            {
              uid: '-5',
              name: 'image.png',
              status: 'done',
              url: urlAssets.imgDesktopUrl
            }
          ]
        : [],
      video: urlAssets.videoUrl
        ? [
            {
              uid: '-6',
              name: 'video.mp4',
              status: 'done',
              url: urlAssets.videoUrl,
              type: 'video/mp4', // bắt buộc để biết là video
              preview: urlAssets.videoUrl // để render preview <video>
            }
          ]
        : []
    });
  }, [urlAssets]);

  const { loadAssets } = useHandleAds();

  const getMediaUrl = async (settings: any) => {
    const bannerUrl = await loadAssets(settings.bannerUrl);
    const logoUrl = await loadAssets(settings.logoImgUrl);
    const imgUrl = await loadAssets(settings.imageUrl);
    const videoUrl = await loadAssets(settings.videoUrl);
    const imgTabletUrl = await loadAssets(settings.imageTabletUrl);
    const imgDesktopUrl = await loadAssets(settings.imageDesktopUrl);

    setUrlAssets({
      imgUrl,
      imgTabletUrl,
      imgDesktopUrl,
      videoUrl,
      bannerUrl,
      logoUrl
    });
  };

  const handleSetDurationVideo = () => {
    const videoElement = videoRef.current;

    if (videoElement && videoElement.duration) {
      formik.setFieldValue('maxLength', videoElement.duration.toFixed(2));
    }
  };

  useEffect(() => {
    if (formik.values) {
      getMediaUrl(formik.values);
    }
    //eslint-disable-next-line
  }, [formik.values]);

  const handleFileChange = (type: FileType, file: File | null) => {
    if (!file) {
      // Xóa ở urlAssets
      setUrlAssets((prev) => ({
        ...prev,
        [`${type}Url`]: ''
      }));

      onFileChange(type, '');
      formik.setFieldValue(fileTypeFieldMap[type], null);
      return;
    }

    // Tạo preview URL cho file mới
    const previewUrl = URL.createObjectURL(file);

    // Cập nhật urlAssets
    setUrlAssets((prev) => ({
      ...prev,
      [`${type}Url`]: previewUrl
    }));

    // Cập nhật fileLists để Upload.Dragger hiển thị ngay
    setFileLists((prev) => ({
      ...prev,
      [type]: [
        {
          uid: String(Date.now()),
          name: file.name,
          status: 'done',
          url: previewUrl
        }
      ]
    }));

    // Callback + formik
    onFileChange(type, previewUrl);
    formik.setFieldValue(fileTypeFieldMap[type], file);
  };

  const handleDeviceChange = (event: React.MouseEvent<HTMLElement>, newDevice: string) => {
    if (newDevice) {
      formik.setFieldValue('deviceType', newDevice);
    }
  };

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
      case AdType.SURVEY2:
        return `${intl.formatMessage({ id: 'survey-information' })} 2`;

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
      fileList: fileLists[fieldName] || [],
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
      onChange: (info) => {
        setFileLists((prev) => ({
          ...prev,
          [fieldName]: info.fileList
        }));
      },
      onRemove: () => {
        handleFileChange(fieldName, null);
        setFileLists((prev) => ({
          ...prev,
          [fieldName]: []
        }));
      },
      showUploadList: {
        showPreviewIcon: true,
        showRemoveIcon: false,
        showDownloadIcon: false
      },
      listType: 'picture-card' // hoặc "text", "picture"
    };

    return props;
  };

  return (
    <FormikProvider value={formik}>
      <Box className="pb-5">
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
          <Stack direction={'row'} justifyContent="space-between" alignItems={'center'} spacing={2} flexWrap={'nowrap'}>
            <Box className="flex-1 min-w-0">
              <Typography variant="h4" fontWeight="700" className="text-lg md:text-xl line-clamp-1">
                {renderAdTitle(adType)}
              </Typography>
            </Box>

            <ToggleButtonGroup
              className="tour-device-selector"
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

        <div className="md:max-h-[calc(100vh-300px)] overflow-y-auto md:pr-3">
          {/* Hidden Video Player */}
          {urlAssets.videoUrl ? (
            <CardMedia
              component="video"
              src={urlAssets.videoUrl}
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

          <>
            {/* Media Upload Section */}
            <SectionCard title={intl.formatMessage({ id: 'general' })} icon={<VideoPlay size="20" />}>
              <Grid container spacing={3}>
                {/* Video Upload với preview */}
                {(adType === AdType.VIDEO || adType === AdType.VIDEO_BANNER) && (
                  <Grid item xs={12} className="tour-form-upload-video">
                    <Typography variant="subtitle2" gutterBottom>
                      {intl.formatMessage({ id: 'upload-video' })}
                    </Typography>
                    <Upload.Dragger {...handleCustomUpload('video', 'video/*')} style={{ padding: '12px' }}>
                      <div className="ant-upload-drag-icon flex justify-center mb-2">
                        <Image style={{ fontSize: '48px', color: '#1890ff' }} />
                      </div>
                      <p className="ant-upload-text">{intl.formatMessage({ id: 'upload-video-placeholder' })}</p>
                      <Typography variant="caption" color={'text.secondary'}>
                        {intl.formatMessage({ id: 'supported-format' })}: MP4, AVI, MOV
                      </Typography>
                    </Upload.Dragger>

                    {/* Preview video */}
                    {/* {fileLists['video']?.map((file: any) =>
                      file.type.startsWith('video/') ? (
                        <video
                          key={file.uid}
                          src={file.preview}
                          controls
                          style={{
                            marginTop: 16,
                            width: '100%',
                            borderRadius: 8,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }}
                        />
                      ) : null
                    )} */}
                  </Grid>
                )}

                {/* Logo Upload với picture card */}
                <Grid item xs={12} className="tour-form-upload-logo">
                  <Typography variant="subtitle2" gutterBottom>
                    {intl.formatMessage({ id: 'upload-logo' })}
                  </Typography>
                  <Upload.Dragger {...handleCustomUpload('logo', 'image/*')} style={{ padding: '12px' }}>
                    <div className="ant-upload-drag-icon flex justify-center mb-2">
                      <Image style={{ fontSize: '48px', color: '#1890ff' }} />
                    </div>
                    <p className="ant-upload-text">{intl.formatMessage({ id: 'upload-image-placeholder' })}</p>
                    <Typography variant="caption" color={'text.secondary'}>
                      {intl.formatMessage({ id: 'supported-format' })}: JPG, PNG, GIF, WEBP
                    </Typography>
                  </Upload.Dragger>
                </Grid>

                {/* Other uploads tương tự */}
                {adType !== AdType.VIDEO && (
                  <Grid item xs={12} className="tour-form-upload-banner">
                    <Typography variant="subtitle2" gutterBottom>
                      {intl.formatMessage({ id: 'upload-banner' })}
                    </Typography>
                    <Upload.Dragger
                      {...handleCustomUpload(adType === AdType.VIDEO_BANNER ? 'banner' : 'img', 'image/*')}
                      style={{ padding: '12px' }}
                    >
                      <div className="ant-upload-drag-icon flex justify-center mb-2">
                        <Image style={{ fontSize: '48px', color: '#1890ff' }} />
                      </div>
                      <p className="ant-upload-text">{intl.formatMessage({ id: 'upload-image-placeholder' })}</p>
                      <Typography variant="caption" color={'text.secondary'}>
                        {intl.formatMessage({ id: 'supported-format' })}: JPG, PNG, GIF, WEBP
                      </Typography>
                    </Upload.Dragger>
                  </Grid>
                )}
                {(adType === AdType.BANNER || adType === AdType.SURVEY || adType === AdType.SURVEY2) && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        {intl.formatMessage({ id: 'upload-banner-tablet' })}
                      </Typography>
                      <Upload.Dragger {...handleCustomUpload('img_tablet', 'image/*')} style={{ padding: '12px' }}>
                        <div className="ant-upload-drag-icon flex justify-center mb-2">
                          <Image style={{ fontSize: '48px', color: '#1890ff' }} />
                        </div>
                        <p className="ant-upload-text">{intl.formatMessage({ id: 'upload-image-placeholder' })}</p>
                        <Typography variant="caption" color={'text.secondary'}>
                          {intl.formatMessage({ id: 'supported-format' })}: JPG, PNG, GIF, WEBP
                        </Typography>
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
                        <p className="ant-upload-text">{intl.formatMessage({ id: 'upload-image-placeholder' })}</p>
                        <Typography variant="caption" color={'text.secondary'}>
                          {intl.formatMessage({ id: 'supported-format' })}: JPG, PNG, GIF, WEBP
                        </Typography>
                      </Upload.Dragger>
                    </Grid>
                  </>
                )}
              </Grid>
            </SectionCard>

            {/* Video Settings */}
            {(adType === AdType.VIDEO || adType === AdType.VIDEO_BANNER) && (
              <SectionCard title="Cài đặt Video" icon={<Setting size="20" />}>
                <TextField
                  className="w-full"
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
              </SectionCard>
            )}

            {/* Design Settings */}
            <Box className="tour-form-design">
              <SectionCard title={intl.formatMessage({ id: 'design' })} icon={<ColorSwatch size="20" />}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12} md={6}>
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
                    name="nonSkip"
                    value={formik.values.nonSkip}
                    onChange={formik.handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ color: 'primary.main' }}></Box>
                            <Typography variant="body2" fontWeight="500" color="text.secondary">
                              {intl.formatMessage({ id: 'non-skip' })}:
                            </Typography>
                          </Stack>
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

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="text"
                    name="buttonTextEn"
                    value={formik.values.buttonTextEn}
                    onChange={formik.handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ color: 'primary.main' }}>{<Text size="18" />}</Box>
                            <Typography variant="body2" fontWeight="500" color="text.secondary">
                              {intl.formatMessage({ id: 'button-content' })} (ENG):
                            </Typography>
                          </Stack>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                {/* Thêm footerEmail */}
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    type="email"
                    name="footerEmail"
                    value={formik.values.footerEmail}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.footerEmail && Boolean(formik.errors.footerEmail)}
                    helperText={formik.touched.footerEmail && formik.errors.footerEmail}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ color: 'primary.main' }}>
                              <Message size="18" />
                            </Box>
                            <Typography variant="body2" fontWeight="500" color="text.secondary">
                              {intl.formatMessage({ id: 'footer-email' })}:
                            </Typography>
                          </Stack>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                {/* Thêm footerPhone */}
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    type="tel"
                    name="footerPhone"
                    value={formik.values.footerPhone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.footerPhone && Boolean(formik.errors.footerPhone)}
                    helperText={formik.touched.footerPhone && formik.errors.footerPhone}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ color: 'primary.main' }}>
                              <Call size="18" />
                            </Box>
                            <Typography variant="body2" fontWeight="500" color="text.secondary">
                              {intl.formatMessage({ id: 'footer-phone' })}:
                            </Typography>
                          </Stack>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                {(adType === AdType.SURVEY || adType === AdType.SURVEY2) && (
                  <>
                    {/* Title Survey */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="text"
                        name="titleSurvey"
                        value={formik.values.titleSurvey}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.titleSurvey && Boolean(formik.errors.titleSurvey)}
                        helperText={formik.touched.titleSurvey && formik.errors.titleSurvey}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Box sx={{ color: 'primary.main' }}>
                                  <Text size="18" />
                                </Box>
                                <Typography variant="body2" fontWeight="500" color="text.secondary">
                                  {intl.formatMessage({ id: 'survey-title' })}:
                                </Typography>
                              </Stack>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>

                    {/* Subtitle Survey */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="text"
                        name="subtitleSurvey"
                        value={formik.values.subtitleSurvey}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.subtitleSurvey && Boolean(formik.errors.subtitleSurvey)}
                        helperText={formik.touched.subtitleSurvey && formik.errors.subtitleSurvey}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Box sx={{ color: 'primary.main' }}>
                                  <Text size="18" />
                                </Box>
                                <Typography variant="body2" fontWeight="500" color="text.secondary">
                                  {intl.formatMessage({ id: 'survey-subtitle' })}:
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
            </Box>

            {/* Link Settings */}
            <Box className="tour-form-url">
              <SectionCard title={intl.formatMessage({ id: 'url' })} icon={<Link size="20" />}>
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
                {/* {adType == AdType.SURVEY2 && formik.values.isEnable3rdParty === 'true' && ( */}
                <>
                  {[
                    { name: 'impressionTag3rdPartyImage', label: 'impression_tag_3rd_party_image' },
                    { name: 'impressionTag3rdPartyIframe', label: 'impression_tag_3rd_party_iframe' },
                    { name: 'impressionTag3rdPartyJs', label: 'impression_tag_3rd_party_js' },
                    { name: 'impressionTag3rdPartyClick', label: 'impression_tag_3rd_party_click' }
                  ].map((field) => (
                    <Grid item xs={12} key={field.name}>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {field.name !== 'isEnable3rdParty' && (
                            <Box sx={{ color: 'primary.main' }}>
                              <Link size="18" />
                            </Box>
                          )}

                          <Typography variant="body2" fontWeight={500} color="text.secondary">
                            {intl.formatMessage({ id: field.label })}
                          </Typography>
                        </Stack>

                        {field.name == 'isEnable3rdParty' ? (
                          <CustomSwitch
                            sx={{ justifyContent: 'space-between' }}
                            value={formik.values[field.name] === 'true'}
                            onChange={(checked) => formik.setFieldValue(field.name, checked ? 'true' : 'false')}
                            name={field.name}
                            checkedLabel={intl.formatMessage({ id: 'enabled' })}
                            uncheckedLabel={intl.formatMessage({ id: 'off' })}
                          />
                        ) : (
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            name={field.name}
                            value={formik.values[field.name]}
                            onChange={formik.handleChange}
                          />
                        )}
                      </Stack>
                    </Grid>
                  ))}
                </>
                {/* )} */}
              </Grid>
            </SectionCard>

            {/* Layout Settings */}
            <SectionCard title={intl.formatMessage({ id: 'layout' })} icon={<Monitor size="20" />}>
              <Grid container spacing={2} alignItems="center" sx={{ marginBottom: '25px' }}>
                <Grid item xs={12} md={6}>
                  <CustomSwitch
                    sx={{ justifyContent: 'space-between' }}
                    label={intl.formatMessage({ id: 'have-nav-footer' })}
                    value={formik.values.layoutNum === 1}
                    onChange={(checked) => formik.setFieldValue('layoutNum', checked ? 1 : 2)}
                    name="layoutNum-switch"
                  />
                </Grid>
                {(adType === AdType.SURVEY || adType === AdType.SURVEY2) && (
                  <>
                    <Grid item xs={12} md={6}>
                      <CustomSwitch
                        sx={{ justifyContent: 'space-between' }}
                        label={intl.formatMessage({ id: 'fullname' })}
                        value={formik.values.fullname === 'true'}
                        onChange={(checked) => formik.setFieldValue('fullname', checked ? 'true' : 'false')}
                        name="fullname-switch"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CustomSwitch
                        sx={{ justifyContent: 'space-between' }}
                        label={intl.formatMessage({ id: 'phone-number' })}
                        value={formik.values.phoneNumber === 'true'}
                        onChange={(checked) => formik.setFieldValue('phoneNumber', checked ? 'true' : 'false')}
                        name="phoneNumber-switch"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CustomSwitch
                        sx={{ justifyContent: 'space-between' }}
                        label={intl.formatMessage({ id: 'email' })}
                        value={formik.values.email === 'true'}
                        onChange={(checked) => formik.setFieldValue('email', checked ? 'true' : 'false')}
                        name="email-switch"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CustomSwitch
                        sx={{ justifyContent: 'space-between' }}
                        label={intl.formatMessage({ id: 'birth-of-date' })}
                        value={formik.values.BoD === 'true'}
                        onChange={(checked) => formik.setFieldValue('BoD', checked ? 'true' : 'false')}
                        name="BoD-switch"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CustomSwitch
                        sx={{ justifyContent: 'space-between' }}
                        label={intl.formatMessage({ id: 'gender' })}
                        value={formik.values.gender === 'true'}
                        onChange={(checked) => formik.setFieldValue('gender', checked ? 'true' : 'false')}
                        name="gender-switch"
                      />
                    </Grid>

                    {/* Bật/tắt đánh giá */}
                    <Grid item xs={12} md={6}>
                      <CustomSwitch
                        sx={{ justifyContent: 'space-between' }}
                        label={intl.formatMessage({ id: 'enable-rating' })}
                        value={formik.values.isRating === 'true'}
                        onChange={(checked) => formik.setFieldValue('isRating', checked ? 'true' : 'false')}
                        name="isRating"
                      />
                    </Grid>

                    {/* Hiện input khi bật đánh giá */}
                    {formik.values.isRating === 'true' && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          type="text"
                          name="ratingTitle"
                          value={formik.values.ratingTitle}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.ratingTitle && Boolean(formik.errors.ratingTitle)}
                          helperText={formik.touched.ratingTitle && formik.errors.ratingTitle}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Box sx={{ color: 'primary.main' }}>
                                    <Text size="18" />
                                  </Box>
                                  <Typography variant="body2" fontWeight="500" color="text.secondary">
                                    {intl.formatMessage({ id: 'rating-title' })}:
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
                {adType === AdType.SURVEY2 && (
                  <>
                    <Grid item xs={12} md={6}>
                      <CustomSwitch
                        sx={{ justifyContent: 'space-between' }}
                        label={intl.formatMessage({ id: 'is-otp-enable' })}
                        value={formik.values.isOtpEnable === 'true'}
                        onChange={(checked) => formik.setFieldValue('isOtpEnable', checked ? 'true' : 'false')}
                        name="isOtpEnable"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <CustomSwitch
                        sx={{ justifyContent: 'space-between' }}
                        label={intl.formatMessage({ id: 'is_enable_3rd_party' })}
                        value={formik.values.isEnable3rdParty === 'true'}
                        onChange={(checked) => formik.setFieldValue('isEnable3rdParty', checked ? 'true' : 'false')}
                        name="isEnable3rdParty"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CustomSwitch
                        sx={{ justifyContent: 'space-between' }}
                        label={`${intl.formatMessage({ id: 'is-optional-question' })} 1`}
                        value={formik.values.isOptionalQuestion === 'true'}
                        onChange={(checked) => formik.setFieldValue('isOptionalQuestion', checked ? 'true' : 'false')}
                        name="isOptionalQuestion"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <CustomSwitch
                        sx={{ justifyContent: 'space-between' }}
                        label={`${intl.formatMessage({ id: 'is-optional-question' })} 2`}
                        value={formik.values.isOptionalQuestion1 === 'true'}
                        onChange={(checked) => formik.setFieldValue('isOptionalQuestion1', checked ? 'true' : 'false')}
                        name="isOptionalQuestion1"
                      />
                    </Grid>

                    {/* SECTION 1 */}
                    {formik.values.isOptionalQuestion === 'true' && (
                      <>
                        <Grid item xs={12}>
                          <Typography variant="h6" className="mb-0 font-bold" color="primary" gutterBottom>
                            {intl.formatMessage({ id: 'optional-question' })} 1
                          </Typography>
                        </Grid>
                        <OptionalQuestionSection
                          intl={intl}
                          formik={formik}
                          questionName="optionalQuestion"
                          typeAnswerName="typeOptionalAnswer"
                          answerArrayName="optionalAnswer"
                        />
                      </>
                    )}

                    {/* SECTION 2 */}
                    {formik.values.isOptionalQuestion1 === 'true' && (
                      <>
                        <Grid item xs={12} mt={2}>
                          <Typography variant="h6" className="mb-0 font-bold" color="primary" gutterBottom>
                            {intl.formatMessage({ id: 'optional-question' })} 2
                          </Typography>
                        </Grid>

                        <OptionalQuestionSection
                          intl={intl}
                          formik={formik}
                          questionName="optionalQuestion1"
                          typeAnswerName="typeOptionalAnswer1"
                          answerArrayName="optionalAnswer1"
                        />
                      </>
                    )}
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
                  onChange={(checked) => formik.setFieldValue('oneClick', checked ? 'true' : 'false')}
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
                        onChange={(checked) => formik.setFieldValue('facebook', checked ? 'true' : 'false')}
                        name="facebook-switch"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomSwitch
                        sx={{ justifyContent: 'space-between' }}
                        label="Google"
                        value={formik.values.google === 'true'}
                        onChange={(checked) => formik.setFieldValue('google', checked ? 'true' : 'false')}
                        name="google-switch"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomSwitch
                        sx={{ justifyContent: 'space-between' }}
                        label="Twitter"
                        value={formik.values.twitter === 'true'}
                        onChange={(checked) => formik.setFieldValue('twitter', checked ? 'true' : 'false')}
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
          </>
        </div>
      </Box>
    </FormikProvider>
  );
});

export default AdsForm;
