import axios from 'axios';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

interface VideoAd {
  videoUrl: string;
  bannerUrl: string;
  nonSkip: boolean;
  maxLength: number;
  backgroundColor: string;
  destinationUrl: string;
  buttonText: string;
}

interface Props {
  settings: VideoAd;
  onUpdate: (updated: Partial<VideoAd>) => void;
}

const AdTypeVideo: React.FC<Props> = ({ settings, onUpdate }) => {
  const intl = useIntl();
  const [VideoPreview, setVideoPreview] = useState<string>(settings.videoUrl);

  const handleVideoUpload = async (file: File) => {
    const API_BASE_URL = 'http://localhost:5055';
    const UPLOAD_ENDPOINT = `${API_BASE_URL}/v1/ad_management/upload_video`;
    const GET_AD_ENDPOINT = `${API_BASE_URL}/v1/ad_management/get_ad`;

    try {
      // Upload the video
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        console.error(uploadData.message || 'Failed to upload video.');
        return;
      }

      // Get the uploaded video metadata
      const getVideoResponse = await axios.get(GET_AD_ENDPOINT);
      const videoUrlPath = getVideoResponse?.data?.data[0]?.image_url.replace('/uploads', '');

      if (!videoUrlPath) {
        console.error('No video URL returned from server.');
        return;
      }

      const fullVideoUrl = `${API_BASE_URL}${videoUrlPath}`;

      // Fetch the video blob
      const videoResponse = await axios.get(fullVideoUrl, {
        headers: {
          'Access-Control-Allow-Origin': 'https://wifi.vtctelecom.com.vn',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        responseType: 'blob'
      });

      // Create a blob URL for the video
      const blobUrl = URL.createObjectURL(videoResponse.data);

      // Update UI with the video
      onUpdate({ videoUrl: blobUrl });
      setVideoPreview(blobUrl);
    } catch (error) {
      console.error('Error during video upload or processing:', error);
    }
  };
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{intl.formatMessage({ id: 'video-ad-settings' })}</h3>
      {/* <label className="block">
        <span className="text-sm font-medium">{intl.formatMessage({ id: 'video-url' })}:</span>
        <input
          type="text"
          value={settings.videoUrl}
          onChange={(e) => onUpdate({ videoUrl: e.target.value })}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
        />
      </label> */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">{intl.formatMessage({ id: 'upload-img' })}:</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleVideoUpload(e.target.files[0]);
            }
          }}
          className="p-2 border border-gray-300 rounded-md"
        />
        {VideoPreview && <video src={VideoPreview} className="w-full h-auto mt-2 border border-gray-200 rounded-md" />}
      </div>

      <label className="block">
        <span className="text-sm font-medium">{intl.formatMessage({ id: 'banner-url' })}:</span>
        <input
          type="text"
          value={settings.bannerUrl}
          onChange={(e) => onUpdate({ bannerUrl: e.target.value })}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
        />
      </label>
      <label className="flex items-center space-x-2">
        <span className="text-sm font-medium">{intl.formatMessage({ id: 'non-skip' })}:</span>
        <input type="checkbox" checked={settings.nonSkip} onChange={(e) => onUpdate({ nonSkip: e.target.checked })} className="h-4 w-4" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">
          {intl.formatMessage({ id: 'max-length' })} ({intl.formatMessage({ id: 'seconds' })}):
        </span>
        <input
          type="number"
          value={settings.maxLength}
          min={1}
          onChange={(e) => onUpdate({ maxLength: parseInt(e.target.value, 10) || 0 })}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">{intl.formatMessage({ id: 'bg-color' })}:</span>
        <input
          type="color"
          value={settings.backgroundColor}
          onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
          className="mt-1"
        />
      </label>
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">{intl.formatMessage({ id: 'button-content' })}:</label>
        <input
          type="text"
          value={settings.buttonText}
          onChange={(e) => onUpdate({ buttonText: e.target.value })}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <label className="block">
        <span className="text-sm font-medium">{intl.formatMessage({ id: 'destination-url' })}:</span>
        <input
          type="text"
          value={settings.destinationUrl}
          onChange={(e) => onUpdate({ destinationUrl: e.target.value })}
          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
        />
      </label>
    </div>
  );
};

export default AdTypeVideo;
