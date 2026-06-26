import React, { useEffect, useState } from 'react';
import AdTypeVideo from './AdTypeVideo';
import AdPreview from './AdPreview';
import AdTypeBanner from './AdTypeBanner';
import MainCard from 'shared/components/MainCard';
import axios from 'axios';
// import { GalleryEdit, VideoPlay } from 'iconsax-react';
// import { Box, Tab, Tabs } from '@mui/material';
// import { useLocation, Link, Outlet } from 'react-router-dom';

const AdManager: React.FC = () => {
  interface BannerAd {
    imageUrl?: string;
    backgroundColor?: string;
    buttonColor?: string;
    buttonText?: string;
    destinationUrl?: string;
  }

  interface VideoAd {
    videoUrl?: string;
    bannerUrl?: string;
    nonSkip?: boolean;
    maxLength?: number;
    backgroundColor?: string;
    buttonText?: string;
    destinationUrl?: string;
  }

  type AdType = 'banner' | 'video';

  interface AdSettings {
    type: AdType;
    banner?: BannerAd;
    video?: VideoAd;
  }

  const [adSettings, setAdSettings] = useState<AdSettings>({
    type: 'banner',
    banner: {
      imageUrl: 'https://www.vtctelecom.com.vn/images/deffiles/viLogo.png',
      backgroundColor: '#ffffff',
      buttonColor: '#0000ff',
      buttonText: 'Truy cập Internet(Access Internet)',
      destinationUrl: 'https://www.vtctelecom.com.vn/'
    },
    video: {
      videoUrl: 'https://www.youtube.com/watch?v=JL_AUSdqwg4&ab_channel=VTCTelecom',
      bannerUrl: '',
      nonSkip: false,
      maxLength: 10,
      backgroundColor: '#000000',
      buttonText: 'Truy cập Internet(Access Internet)',
      destinationUrl: 'https://www.vtctelecom.com.vn/'
    }
  });

  useEffect(() => {
    const fetchAdSettings = async () => {
      try {
        const response = await axios.get('https://wifi.vtctelecom.com.vn/api/vtc_wifi_management/v1/ad_management/get_ad');
        if (response.data) {
          const data = response.data.data[0];
          const API_BASE_URL = 'http://localhost:5055';
          const imgData = data?.image_url;
          const videoData = data?.video_url;
          const imageUrlPath = imgData.replace('/uploads', '');
          const videoUrlPath = videoData.replace('/uploads', '');

          const fullImageUrl = `${API_BASE_URL}${imageUrlPath}`;
          const fullVideoUrl = `${API_BASE_URL}${videoUrlPath}`;
          const imageResponse = await axios.get(fullImageUrl, {
            headers: {
              'Access-Control-Allow-Origin': 'https://wifi.vtctelecom.com.vn',
              'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            responseType: 'blob'
          });

          // Create a blob URL for the image
          const blobUrlImage = URL.createObjectURL(imageResponse.data);

          const videoResponse = await axios.get(fullVideoUrl, {
            headers: {
              'Access-Control-Allow-Origin': 'https://wifi.vtctelecom.com.vn',
              'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            responseType: 'blob'
          });

          // Create a blob URL for the image
          const blobUrlVideo = URL.createObjectURL(videoResponse.data);

          setAdSettings({
            type: data.ad_type || 'banner',
            banner: {
              imageUrl: blobUrlImage || '',
              backgroundColor: data.background_color || '#ffffff',
              buttonColor: data.button_color || '#0000ff',
              buttonText: data.button_text || 'Truy cập Internet(Access Internet)',
              destinationUrl: data.destination_url || ''
            },
            video: {
              videoUrl: blobUrlVideo || '',
              bannerUrl: data.banner_url || '',
              nonSkip: data.non_skip || false,
              maxLength: data.max_length || 10,
              backgroundColor: data.background_color || '#000000',
              destinationUrl: data.destination_url || ''
            }
          });
        }
      } catch (error) {
        console.error('Error fetching ad settings:', error);
      }
    };

    fetchAdSettings();
  }, []);

  const handleUpdate = (newSettings: Partial<AdSettings>) => {
    setAdSettings((prev) => ({
      ...prev,
      ...newSettings,
      banner: {
        imageUrl: '',
        backgroundColor: '#ffffff',
        buttonColor: '#0000ff',
        buttonText: 'Click Here',
        destinationUrl: '',
        ...prev.banner,
        ...newSettings.banner
      },
      video: {
        videoUrl: '',
        bannerUrl: '',
        nonSkip: false,
        maxLength: 10,
        backgroundColor: '#000000',
        buttonText: 'Click Here',
        destinationUrl: '',
        ...prev.video,
        ...newSettings.video
      }
    }));
  };

  const handleSave = async () => {
    try {
      const data = {
        adType: adSettings.type,
        imageUrl: adSettings.banner?.imageUrl,
        backgroundColor: adSettings.banner?.backgroundColor,
        buttonColor: adSettings.banner?.buttonColor,
        buttonText: adSettings.banner?.buttonText || adSettings.video?.buttonText,
        destinationUrl: adSettings.banner?.destinationUrl,
        videoUrl: adSettings.video?.videoUrl,
        bannerUrl: adSettings.video?.bannerUrl,
        non_skip: adSettings.video?.nonSkip,
        max_length: adSettings.video?.maxLength
      };
      const response = await axios.post('https://wifi.vtctelecom.com.vn/api/vtc_wifi_management/v1/ad_management/add_ad', data);

      if (!response.data) {
        throw new Error('Failed to save ad settings');
      }
      alert('Ad settings saved successfully:');

      // console.log('Ad settings saved successfully:', response.data);
      // Xử lý dữ liệu trả về nếu cần
    } catch (error) {
      alert('Error saving ad settings:');

      // console.error('Error saving ad settings:', error);
    }
  };

  // const { pathname } = useLocation();

  // let selectedTab = 0;

  // switch (pathname) {
  //   case `/ads-management/ads-video`:
  //     selectedTab = 1;
  //     break;
  //   case `/ads-management/ads-ads-banner`:
  //   default:
  //     selectedTab = 0;
  // }

  // const [value, setValue] = useState(selectedTab);

  // useEffect(() => {
  //   setValue(selectedTab);
  // }, [selectedTab]);

  // const handleChange = (event: SyntheticEvent, newValue: number) => {
  //   setValue(newValue);
  // };

  return (
    <>
      {/* <MainCard border={false}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="account profile tab">
            <Tab label="Banner" component={Link} to={`/ads-management/ads-banner`} icon={<GalleryEdit />} iconPosition="start" />
            <Tab label="Video" component={Link} to={`/ads-management/ads-video`} icon={<VideoPlay />} iconPosition="start" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <Outlet />
        </Box>
      </MainCard> */}

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="mt-6 space-x-4">
            <button
              onClick={() => handleUpdate({ type: 'banner' })}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Banner
            </button>
            <button
              onClick={() => handleUpdate({ type: 'video' })}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              Video
            </button>
          </div>

          <MainCard className="mt-6">
            {adSettings.type === 'banner' && (
              <AdTypeBanner
                settings={{
                  imageUrl: adSettings.banner?.imageUrl || '',
                  backgroundColor: adSettings.banner?.backgroundColor || '#ffffff',
                  buttonColor: adSettings.banner?.buttonColor || '#0000ff',
                  buttonText: adSettings.banner?.buttonText || 'Click Here',
                  destinationUrl: adSettings.banner?.destinationUrl || ''
                }}
                onUpdate={(updated) => handleUpdate({ banner: { ...adSettings.banner, ...updated } })}
              />
            )}

            {adSettings.type === 'video' && (
              <AdTypeVideo
                settings={{
                  videoUrl: adSettings.video?.videoUrl || '',
                  bannerUrl: adSettings.video?.bannerUrl || '',
                  nonSkip: adSettings.video?.nonSkip || false,
                  maxLength: adSettings.video?.maxLength || 10,
                  backgroundColor: adSettings.video?.backgroundColor || '#000000',
                  buttonText: adSettings.banner?.buttonText || 'Click Here',
                  destinationUrl: adSettings.video?.destinationUrl || ''
                }}
                onUpdate={(updated) => handleUpdate({ video: { ...adSettings.video, ...updated } })}
              />
            )}

            <button
              onClick={handleSave}
              className="mt-4 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              Save
            </button>
          </MainCard>
        </div>

        <div className="flex-1">
          <AdPreview settings={adSettings} />
        </div>
      </div>
    </>
  );
};

export default AdManager;
