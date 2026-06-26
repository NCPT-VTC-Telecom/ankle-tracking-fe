import axios from 'axios';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

interface BannerAd {
  imageUrl: string;
  backgroundColor: string;
  buttonColor: string;
  buttonText: string;
  destinationUrl: string;
}

interface Props {
  settings: BannerAd;
  onUpdate: (updated: Partial<BannerAd>) => void;
}

const AdTypeBanner: React.FC<Props> = ({ settings, onUpdate }) => {
  const intl = useIntl();
  const [imagePreview, setImagePreview] = useState<string>(settings.imageUrl);

  const handleImageUpload = async (file: File) => {
    const API_BASE_URL = 'http://localhost:5055';
    const UPLOAD_ENDPOINT = `${API_BASE_URL}/v1/ad_management/upload_img`;
    const GET_AD_ENDPOINT = `${API_BASE_URL}/v1/ad_management/get_ad`;

    try {
      // Upload the image
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        console.error(uploadData.message || 'Failed to upload image.');
        return;
      }

      // Get the uploaded image metadata
      const getImageResponse = await axios.get(GET_AD_ENDPOINT);
      const imageUrlPath = getImageResponse?.data?.data[0]?.image_url.replace('/uploads', '');

      if (!imageUrlPath) {
        console.error('No image URL returned from server.');
        return;
      }

      const fullImageUrl = `${API_BASE_URL}${imageUrlPath}`;

      // Fetch the image blob
      const imageResponse = await axios.get(fullImageUrl, {
        headers: {
          'Access-Control-Allow-Origin': 'https://wifi.vtctelecom.com.vn',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        responseType: 'blob'
      });

      // Create a blob URL for the image
      const blobUrl = URL.createObjectURL(imageResponse.data);

      // Update UI with the image
      onUpdate({ imageUrl: blobUrl });
      setImagePreview(blobUrl);
    } catch (error) {
      console.error('Error during image upload or processing:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{intl.formatMessage({ id: 'banner-setting' })}</h3>
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">{intl.formatMessage({ id: 'upload-img' })}:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleImageUpload(e.target.files[0]);
            }
          }}
          className="p-2 border border-gray-300 rounded-md"
        />
        {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-auto mt-2 border border-gray-200 rounded-md" />}
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">{intl.formatMessage({ id: 'bg-color' })}:</label>
        <input
          type="color"
          value={settings.backgroundColor}
          onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
          className="p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">{intl.formatMessage({ id: 'button-color' })}:</label>
        <input
          type="color"
          value={settings.buttonColor}
          onChange={(e) => onUpdate({ buttonColor: e.target.value })}
          className="p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">{intl.formatMessage({ id: 'button-content' })}:</label>
        <input
          type="text"
          value={settings.buttonText}
          onChange={(e) => onUpdate({ buttonText: e.target.value })}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">{intl.formatMessage({ id: 'destination-url' })}:</label>
        <input
          type="text"
          value={settings.destinationUrl}
          onChange={(e) => onUpdate({ destinationUrl: e.target.value })}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default AdTypeBanner;
