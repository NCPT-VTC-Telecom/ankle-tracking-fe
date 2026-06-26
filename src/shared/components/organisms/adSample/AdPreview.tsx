import useHandleAds from 'shared/hooks/useHandleAds';
import React, { useState, useEffect, useMemo } from 'react';
import { NewDataAds } from 'shared/types/Ads';
import styles from './AdPreview.module.css';
import { InputLabel, OutlinedInput, SelectChangeEvent, Skeleton, Step } from '@mui/material';
import { Helmet } from 'react-helmet';
import { Select } from '@mui/material';
import { MenuItem } from '@mui/material';
import { FormControl } from '@mui/material';
import LanguageSwitcher from 'shared/components/template/LanguageSwitcher';
import { Stepper } from '@mui/material';
import { StepButton } from '@mui/material';
import { getContrastingColor } from 'shared/utils/getColors';

interface Props {
  settings: NewDataAds;
  previewImages: { img?: string; logo?: string; banner?: string; video?: string; imgTabletUrl?: string; imgDesktopUrl?: string };
}

export interface UrlAccess {
  imgUrl: string | undefined | null;
  imgTabletUrl: string | undefined | null;
  imgDesktopUrl: string | undefined | null;
  videoUrl: string | undefined | null;
  bannerUrl: string | undefined | null;
  logoUrl: string | undefined | null;
}

type AdType = 'banner' | 'video1' | 'video2' | 'survey' | 'survey2' | 'app';

const AdPreview: React.FC<Props> = React.memo(({ settings, previewImages }) => {
  const { loadAssets } = useHandleAds();
  const [countdown, setCountdown] = useState(5);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [answer, setAnswer] = React.useState<string[]>([]);
  const [answer1, setAnswer1] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  const optionalAnswers: string[] = !!settings?.optionalAnswer ? (settings?.optionalAnswer as string[]) : [''];
  const optionalAnswers1: string[] = !!settings?.optionalAnswer1 ? (settings?.optionalAnswer1 as string[]) : [''];

  const totalSteps = useMemo(() => {
    return settings.adType === 'survey' || settings.adType === 'survey2' ? 3 : 2;
  }, [settings]);

  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

  const getStepLabel = (index: number) => {
    return `Màn số ${index + 1}`;
  };

  const [urlAssets, setUrlAssets] = useState<UrlAccess>({
    imgUrl: '',
    imgTabletUrl: '',
    imgDesktopUrl: '',
    videoUrl: '',
    bannerUrl: '',
    logoUrl: ''
  });

  const loadImg = async () => {
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
    setIsLoading(false);
  };

  useEffect(() => {
    loadImg();
    //eslint-disable-next-line
  }, [settings.bannerUrl, settings.logoImgUrl, settings.videoUrl, settings.imageUrl, settings.deviceType]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setButtonEnabled(true);
    }
  }, [countdown]);

  const widthDevice = settings.deviceType === 'phone' ? '420px' : settings.deviceType === 'tablet' ? '768px' : '1024px';

  const handleChange = (event: SelectChangeEvent<typeof answer>) => {
    const {
      target: { value, name }
    } = event;

    const newValue = typeof value === 'string' ? value.split(',') : value;

    if (name === 'optionalAnswer') {
      setAnswer(newValue);
    } else if (name === 'optionalAnswer1') {
      setAnswer1(newValue);
    }
  };

  const getBannerUrl = (deviceType: string) => {
    switch (deviceType) {
      case 'laptop':
        return previewImages.imgDesktopUrl || urlAssets.imgDesktopUrl;
      case 'tablet':
        return previewImages.imgTabletUrl || urlAssets.imgTabletUrl;
      case 'mobile':
        return previewImages.img || urlAssets.imgUrl;
      default:
        return previewImages.img || urlAssets.imgUrl;
    }
  };

  // Cấu hình step từ step 1 trở đi cho từng type
  const typeSteps: Record<AdType, JSX.Element[]> = {
    banner: [
      <div className="flex flex-col items-center w-full">
        {settings.deviceType === 'phone' ? (
          <div>
            {previewImages?.img || urlAssets?.imgUrl ? (
              <img id={styles.bannerImg} src={previewImages.img || urlAssets.imgUrl || ''} alt="Banner" style={{ width: '100vw' }} />
            ) : (
              <Skeleton variant="rectangular" width="100%" height={200} />
            )}
          </div>
        ) : settings.deviceType === 'tablet' ? (
          <div>
            {previewImages.imgTabletUrl || urlAssets.imgTabletUrl ? (
              <img
                id={styles.bannerImg}
                src={previewImages.imgTabletUrl || urlAssets.imgTabletUrl || ''}
                alt="Banner"
                style={{ width: '100vw' }}
              />
            ) : (
              <Skeleton variant="rectangular" width="100%" height={200} />
            )}
          </div>
        ) : (
          <div>
            {previewImages.imgDesktopUrl || urlAssets.imgDesktopUrl ? (
              <img
                id={styles.bannerImg}
                src={previewImages.imgDesktopUrl || urlAssets.imgDesktopUrl || ''}
                alt="Banner"
                style={{ width: '100vw' }}
              />
            ) : (
              <Skeleton variant="rectangular" width="100%" height={200} />
            )}
          </div>
        )}
        <div className="w-full flex justify-center">
          <div className="flex justify-center rounded-md py-2 font-bold uppercase text-lg tracking-wide disabled:opacity-75 disabled:cursor-not-allowed">
            {settings.oneClick === 'true' ? setupSubmitButton(settings, countdown, buttonEnabled) : renderSocialLoginButtons(settings)}
          </div>
        </div>
      </div>
    ],

    video1: [
      <div className="flex flex-col w-full max-w-4xl mx-auto">
        {/* Video Placeholder with Play Button */}
        <div className="relative w-full">
          {/* Loading State / Thumbnail */}
          <div
            id="videoPlaceholder"
            className={`
            relative w-full bg-black rounded-lg overflow-hidden shadow-lg
            ${isLoading ? 'block' : 'hidden'}
          `}
          >
            {previewImages.video || urlAssets.videoUrl ? (
              <img
                id="videoThumbnail"
                src={previewImages.video || urlAssets.videoUrl || ''}
                className="w-full h-auto object-cover min-h-[200px] md:min-h-[300px]"
                alt="Video Thumbnail"
              />
            ) : (
              <div className="w-full h-[200px] md:h-[300px]">
                <Skeleton variant="rectangular" width="100%" height="100%" className="rounded-lg" />
              </div>
            )}

            {/* Video Overlay */}
            <div id="videoOverlay" className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30">
              {/* Play Button */}
              <button
                id="playButton"
                style={{ backgroundColor: settings.buttonColor || '#000' }}
                className="
                flex items-center justify-center w-16 h-16 md:w-20 md:h-20
                rounded-full text-white shadow-xl
                transform hover:scale-110 active:scale-95
                transition-all duration-200 ease-out
                focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50
              "
              >
                <svg className="w-6 h-6 md:w-8 md:h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </button>

              {/* Call to Action Text */}
              <div className="mt-4 px-4 text-center">
                <p className="text-white font-bold text-sm md:text-lg uppercase tracking-wide drop-shadow-lg">
                  Xem quảng cáo để truy cập wifi
                </p>
                <div className="mt-2 flex items-center justify-center space-x-2 text-white text-xs md:text-sm opacity-90">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Miễn phí WiFi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div
            className={`
            relative w-full overflow-hidden shadow-lg
            ${!isLoading ? 'block' : 'hidden'}
          `}
          >
            {previewImages.video || urlAssets.videoUrl ? (
              <div className="relative">
                <video
                  // id="bannerVideo"
                  src={previewImages.video || urlAssets.videoUrl || ''}
                  className="w-full h-auto object-cover min-h-[200px] md:min-h-[300px]"
                  autoPlay
                  muted
                  onTimeUpdate={(e) => {
                    const playTime = Math.floor((e.target as HTMLVideoElement).currentTime);
                    const remainingTime = Math.max(settings.nonSkip - playTime, 0);
                    setCountdown(remainingTime);

                    if (playTime >= settings.nonSkip) {
                      setButtonEnabled(true);
                    }
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-[200px] md:h-[300px]">
                <Skeleton variant="rectangular" width="100%" height="100%" className="rounded-lg" />
              </div>
            )}
          </div>
        </div>

        {/* Submit Container */}
        <div className="mt-6 text-center space-y-4">
          {/* Action Buttons */}
          <div className="space-y-4">
            {settings.oneClick === 'true' ? (
              setupSubmitButton(settings, countdown, buttonEnabled)
            ) : (
              <div className="space-y-4">
                {/* Divider */}
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <div className="px-3 text-sm text-gray-500 bg-white">Đăng nhập để tiếp tục</div>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Social Login Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">{renderSocialLoginButtons(settings)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    ],

    video2: [
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          position: 'relative',
          height: '100%',
          gap: '20px' // Khoảng cách giữa các phần tử
        }}
      >
        <div id="logoContainer" style={{ display: isLoading ? 'flex' : 'none', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ padding: '30px 50px 40px 50px', backgroundColor: settings.backgroundColor, borderRadius: '5px' }}>
            <div style={{ marginBottom: '10px' }}>
              <b>WIFI miễn phí tài trợ bởi</b>
            </div>
            <div style={{ width: '250px', height: '250px', borderRadius: '5px', margin: 'auto' }}>
              {previewImages.logo || urlAssets.logoUrl ? (
                <img
                  id="logoSmall"
                  src={previewImages.logo || urlAssets.logoUrl || ''}
                  alt="Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Skeleton variant="rectangular" width="100%" height="100%" />
              )}
            </div>
            <button
              style={{
                marginTop: '10px',
                padding: '10px 20px',
                color: getContrastingColor(settings.buttonColor),
                background: settings.buttonColor,
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '75%'
              }}
            >
              <b>Tiếp tục để kết nối Internet (Internet Access)</b>
            </button>
            <div style={{ marginTop: '20px' }}>
              <b>Tôi đồng ý các điều khoản sử dụng WIFI</b>
            </div>
          </div>
        </div>
        <div id="videoContainer" style={{ display: isLoading ? 'none' : 'block', width: '100%' }}>
          <div>
            {previewImages.video || urlAssets.videoUrl ? (
              <video
                id="bannerVideo"
                src={previewImages.video || urlAssets.videoUrl || ''}
                autoPlay
                muted
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  height: 'auto'
                }}
                onTimeUpdate={(e) => {
                  const playTime = Math.floor((e.target as HTMLVideoElement).currentTime);
                  const remainingTime = Math.max(settings.nonSkip - playTime, 0);
                  setCountdown(remainingTime);

                  if (playTime >= settings.nonSkip) {
                    setButtonEnabled(true);
                  }
                }}
              ></video>
            ) : (
              <Skeleton variant="rectangular" width="100%" height={300} />
            )}
          </div>
          <div>
            {previewImages.banner || urlAssets.bannerUrl ? (
              <img
                id="bannerWithVideo"
                src={previewImages.banner || urlAssets.bannerUrl || ''}
                alt="Banner"
                style={{ width: '100%', marginTop: '10px' }}
              />
            ) : (
              <Skeleton variant="rectangular" width="100%" sx={{ marginTop: '10px' }} />
            )}
          </div>
          <div id="submitContainer" style={{ margin: '5px 0 5px 0' }}>
            {settings.oneClick === 'true' ? setupSubmitButton(settings, countdown, buttonEnabled) : renderSocialLoginButtons(settings)}
          </div>
        </div>
      </div>
    ],

    app: [
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'center',
          backgroundColor: settings.backgroundColor
        }}
      >
        <div className={styles.bannerContainer}>
          {previewImages.img || urlAssets.imgUrl ? (
            <img id={styles.bannerImg} src={previewImages.img || urlAssets.imgUrl || ''} alt="Banner" style={{ width: '100vw' }} />
          ) : (
            <Skeleton variant="rectangular" width="100%" height={200} />
          )}
        </div>
        <div className={styles.buttonContainer}>
          {settings.oneClick === 'true' ? setupSubmitButton(settings, countdown, buttonEnabled) : renderSocialLoginButtons(settings)}
        </div>
      </div>
    ],
    survey: [
      <div style={{ flexDirection: settings.deviceType == 'desktop' ? 'row' : 'column' }} className="flex justify-center items-center">
        <div className="">
          <img src={getBannerUrl(settings.deviceType) || ''} alt="Banner" className="w-full object-cover" />
        </div>
        <div>
          <button
            disabled={countdown > 0}
            className="my-3 py-3 px-10 font-bold uppercase text-base tracking-wide disabled:opacity-75 disabled:cursor-not-allowed rounded-md"
            style={{
              backgroundColor: settings?.buttonColor || '#e60000',
              color: getContrastingColor(settings?.buttonColor || '#e60000')
            }}
          >
            {settings?.buttonText || 'KẾT NỐI INTERNET'}
            {countdown > 0 && `(${countdown}s)`}
          </button>
        </div>
      </div>,
      <div className="max-w-2xl mx-auto">
        <form className="bg-white  md:shadow-xl p-3 space-y-6 md:p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">{settings.titleSurvey || 'Khảo sát thông tin người dùng'}</h2>
            <p className="text-gray-600">{settings.subtitleSurvey || 'Vui lòng điền thông tin để tiếp tục truy cập WiFi'}</p>
          </div>

          {/* Full Name Field */}
          {settings?.fullname === 'true' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700" htmlFor="fullName">
                Họ tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Nhập họ tên..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>
          )}

          {/* Phone Number Field */}
          {settings?.phoneNumber === 'true' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700" htmlFor="phoneNumber">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                placeholder="Nhập số điện thoại..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>
          )}

          {/* Email Field */}
          {settings?.email === 'true' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700" htmlFor="email">
                Địa chỉ Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Nhập địa chỉ email..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>
          )}

          {/* Date of Birth Field */}
          {settings?.BoD === 'true' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700" htmlFor="birthdate">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="birthdate"
                name="BoD"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
              />
            </div>
          )}

          {/* Gender Field */}
          {settings?.gender === 'true' && (
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-gray-700 mb-3">
                Giới tính <span className="text-red-500">*</span>
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Nam', 'Nữ', 'Khác'].map((gender) => (
                  <label
                    key={gender}
                    className="flex items-center p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={gender === 'Khác' ? 'Chưa rõ' : gender}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">{gender}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {/* Submit Button or Social Login */}
          <div className="pt-6">
            {settings.oneClick === 'true' ? (
              <button
                style={{ background: settings.buttonColor }}
                id="submitBtnStep1"
                type="submit"
                className="w-full text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>Tiếp tục để truy cập WIFI (Internet Access)</span>
                </div>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <div className="px-3 text-sm text-gray-500 bg-white">Hoặc đăng nhập bằng</div>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>
                {renderSocialLoginButtons(settings)}
              </div>
            )}
          </div>
        </form>
      </div>
    ],
    survey2: [
      <div style={{ flexDirection: settings.deviceType == 'desktop' ? 'row' : 'column' }} className="flex justify-center items-center">
        <div className="">
          <img src={getBannerUrl(settings.deviceType) || ''} alt="Banner" className="w-full object-cover" />
        </div>
        <div>
          <button
            disabled={countdown > 0}
            className="my-3 py-3 px-10 font-bold uppercase text-base tracking-wide disabled:opacity-75 disabled:cursor-not-allowed rounded-md"
            style={{
              backgroundColor: settings?.buttonColor || '#e60000',
              color: getContrastingColor(settings?.buttonColor || '#e60000')
            }}
          >
            {settings?.buttonText || 'KẾT NỐI INTERNET'}
            {countdown > 0 && `(${countdown}s)`}
          </button>
        </div>
      </div>,
      <div className="max-w-2xl mx-auto">
        <form className="bg-white md:shadow-xl p-3 space-y-6 md:p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">Khảo sát thông tin người dùng</h2>
            <p className="text-gray-600">Vui lòng điền thông tin để tiếp tục truy cập WiFi</p>
          </div>

          {/* Full Name Field */}
          {settings?.fullname === 'true' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700" htmlFor="fullName">
                Họ tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Nhập họ tên của bạn..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>
          )}

          {/* Phone Number Field */}
          {settings?.phoneNumber === 'true' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700" htmlFor="phoneNumber">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                placeholder="Nhập số điện thoại..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>
          )}

          {/* Email Field */}
          {settings?.email === 'true' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700" htmlFor="email">
                Địa chỉ Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Nhập địa chỉ email..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>
          )}

          {/* Date of Birth Field */}
          {settings?.BoD === 'true' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700" htmlFor="birthdate">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="birthdate"
                name="BoD"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
              />
            </div>
          )}

          {/* Gender Field */}
          {settings?.gender === 'true' && (
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-gray-700 mb-3">
                Giới tính <span className="text-red-500">*</span>
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Nam', 'Nữ', 'Khác'].map((gender) => (
                  <label
                    key={gender}
                    className="flex items-center p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={gender === 'Khác' ? 'Chưa rõ' : gender}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">{gender}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {/* Optional Question */}
          {settings?.isOptionalQuestion === 'true' && settings.optionalQuestion && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold">{settings.optionalQuestion}</label>
              </div>

              {settings?.typeOptionalAnswer === 'input' ? (
                <input
                  type="text"
                  id="optionalAnswer"
                  name="optionalAnswer"
                  placeholder="Nhập câu trả lời..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
              ) : (
                <div>
                  <FormControl fullWidth>
                    <InputLabel id="optional-answer-label">Chọn câu trả lời</InputLabel>
                    <Select
                      name="optionalAnswer"
                      labelId="optional-answer-label"
                      id="optionalAnswer"
                      multiple={settings?.typeOptionalAnswer === 'select-multiple'}
                      value={answer}
                      onChange={handleChange}
                      input={<OutlinedInput label="Chọn câu trả lời" />}
                    >
                      {optionalAnswers?.map((item, index) => (
                        <MenuItem key={index} value={index}>
                          {item}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              )}
            </div>
          )}

          {/* Optional Question 1 */}
          {settings?.isOptionalQuestion1 === 'true' && settings.optionalQuestion1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold">{settings.optionalQuestion1}</label>
              </div>

              {settings?.typeOptionalAnswer1 === 'input' ? (
                <input
                  type="text"
                  id="optionalAnswer1"
                  name="optionalAnswer1"
                  placeholder="Nhập câu trả lời..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
              ) : (
                <div>
                  <FormControl fullWidth>
                    <InputLabel id="optional-answer1-label">Chọn câu trả lời</InputLabel>
                    <Select
                      name="optionalAnswer1"
                      labelId="optional-answer1-label"
                      id="optionalAnswer1"
                      multiple={settings?.typeOptionalAnswer1 === 'select-multiple'}
                      value={answer1}
                      onChange={handleChange}
                      input={<OutlinedInput label="Chọn câu trả lời" />}
                    >
                      {optionalAnswers1?.map((item, index) => (
                        <MenuItem key={index} value={index}>
                          {item}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              )}
            </div>
          )}

          {/* Submit Button or Social Login */}
          <div className="pt-6">
            {settings.oneClick === 'true' ? (
              <button
                style={{ background: settings.buttonColor }}
                id="submitBtnStep1"
                type="submit"
                className="w-full text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>Tiếp tục để truy cập WIFI (Internet Access)</span>
                </div>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <div className="px-3 text-sm text-gray-500 bg-white">Hoặc đăng nhập bằng</div>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>
                {renderSocialLoginButtons(settings)}
              </div>
            )}
          </div>
        </form>
      </div>
    ]
    // "3rd_party": [
    //   <div className="flex flex-col items-center w-full p-4 gap-4">
    //     <div className="w-full flex flex-col gap-3 max-w-2xl text-left text-sm break-all">
    //       {settings.impressionTag3rdPartyImage ? (
    //         <div dangerouslySetInnerHTML={{ __html: settings.impressionTag3rdPartyImage || '' }}></div>
    //       ) : (
    //         <Skeleton variant="rectangular" width="100%" height={200} />
    //       )}

    //       {settings.impressionTag3rdPartyIframe ? (
    //         <div dangerouslySetInnerHTML={{ __html: settings.impressionTag3rdPartyIframe || '' }}></div>
    //       ) : (
    //         <Skeleton variant="rectangular" width="100%" height={200} />
    //       )}
    //     </div>
    //     <div className="w-full flex justify-center relative">
    //       <div className="flex justify-center w-[calc(100%-50px)] rounded-md py-2 font-bold uppercase text-lg tracking-wide disabled:opacity-75 disabled:cursor-not-allowed">
    //         {settings.oneClick === 'true' ? setupSubmitButton(settings, countdown, buttonEnabled) : renderSocialLoginButtons(settings)}
    //       </div>
    //     </div>
    //   </div>
    // ],
  };

  const renderStepContent = (type: AdType, step: number) => {
    if (step === 0) {
      return <IntroScreen previewImages={previewImages} urlAssets={urlAssets} settings={settings} onContinue={() => setActiveStep(1)} />;
    }

    const stepIndex = step - 1; // vì step 0 là intro
    const steps = typeSteps[type];
    return steps?.[stepIndex] ?? <div>Step {step} không tồn tại cho type này</div>;
  };

  return (
    <div className="my-10 md:my-0">
      {/* Stepper */}
      <Stepper activeStep={activeStep} nonLinear className="tour-preview-stepper">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <Step key={index}>
            <StepButton color="inherit" onClick={handleStep(index)}>
              {getStepLabel(index)}
            </StepButton>
          </Step>
        ))}
      </Stepper>
      <Helmet>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/x-icon" href="./favicon.ico" />
        <meta name="referrer" content="no-referrer" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <title>Captive Portal</title>
      </Helmet>

      <div className="flex justify-center md:p-4 py-4">
        <div className="flex flex-col border border-gray-300 overflow-hidden rounded-xl bg-white shadow-lg" style={{ width: widthDevice }}>
          {settings.layoutNum === 1 && (
            <header id="header" className="px-3 py-2 relative">
              {/* Decorative bottom border */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
              <div className="flex items-center justify-between">
                <div className="mr-2">
                  <LanguageSwitcher />
                </div>
                <div>
                  {previewImages?.logo || urlAssets?.logoUrl ? (
                    <img
                      id="logoPartner"
                      src={previewImages?.logo || urlAssets?.logoUrl || ''}
                      alt="logo partner"
                      className="h-[70px] rounded-lg"
                    />
                  ) : (
                    <Skeleton variant="rectangular" width="100%" sx={{ height: '70px' }} />
                  )}
                </div>
              </div>
            </header>
          )}

          <div className="min-h-[500px]">
            {/* {activeStep === 0 && (
              <IntroScreen
                previewImages={previewImages}
                urlAssets={urlAssets}
                settings={settings}
                onContinue={handleStep(1)}
              />
            )}

            {(settings.adType === "survey" || settings.adType === "survey2") && activeStep === 1 ? (
              <div style={{ flexDirection: settings.deviceType == "desktop" ? "row" : "column" }} className="flex justify-center items-center">
                <div className="">
                  <img
                    src={
                      getBannerUrl(settings.deviceType) || ""
                    }
                    alt="Banner"
                    className="w-full object-cover"
                  />
                </div>
                <div>
                  <button
                    disabled={countdown > 0}
                    className="my-3 py-3 px-10 font-bold uppercase text-base tracking-wide disabled:opacity-75 disabled:cursor-not-allowed rounded-md"
                    style={{
                      backgroundColor: settings?.buttonColor || "#e60000",
                      color: getContrastingColor(
                        settings?.buttonColor || "#e60000"
                      ),
                    }}
                  >
                    {settings?.buttonText ||
                      "KẾT NỐI INTERNET"}
                    {countdown > 0 && `(${countdown}s)`}
                  </button>
                </div>
              </div>

            ) : (
              renderAdContent()
            )}

            {(settings.adType === "survey" || settings.adType === "survey2") && activeStep === 2 && (
              <main className="flex-1 min-h-0">
                <div className="flex items-center p-4 md:p-6 h-full">
                  {renderAdContent()}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
                      <div className="text-lg font-medium text-gray-700">Loading...</div>
                    </div>
                  )}
                </div>
              </main>
            )} */}

            {renderStepContent(settings.adType as AdType, activeStep)}
          </div>

          {settings.layoutNum === 1 && (
            <footer className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 py-6 px-4 mt-auto">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col justify-center space-y-2 items-center">
                  {/* Contact Info */}
                  <div className="text-center">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Advertising:</span>
                      <a
                        href={`tel:+${settings.footerPhone || '842838331106'}`}
                        className="mx-1 text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
                      >
                        {settings.footerPhone || '(+84.28) 38331106'}
                      </a>
                      <span className="text-gray-500">•</span>
                      <a
                        href={`mailto:${settings.footerEmail || 'info@vtctelecom.com.vn'}`}
                        className="ml-1 text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200"
                      >
                        {settings.footerEmail || 'info@vtctelecom.com.vn'}
                      </a>
                    </div>
                  </div>

                  {/* Divider for mobile */}
                  <div className="w-full md:hidden border-t border-gray-300"></div>

                  {/* Powered By */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Powered by</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <strong className="text-gray-800 font-bold">VTC Telecom</strong>
                    </div>
                  </div>
                </div>

                {/* Copyright */}
                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                  <p className="text-xs text-gray-500">© {new Date().getFullYear()} VTC Telecom. All rights reserved.</p>
                </div>
              </div>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
});

export default AdPreview;

// Step 1
const IntroScreen = ({ previewImages, urlAssets, settings, onContinue }: any) => (
  <div className="flex items-center justify-center  pointer-events-auto my-10">
    <div className="p-6 bg-white rounded-lg shadow-lg text-center max-w-sm w-full">
      <h2 className="mb-4 font-bold text-lg text-gray-800">WIFI miễn phí tài trợ bởi</h2>
      <div style={{ background: settings?.buttonColor || '#0065b2' }} className="w-20 h-1 rounded-full mx-auto"></div>
      <div className="mt-2">
        {previewImages?.logo || urlAssets?.logoUrl ? (
          <img
            src={previewImages?.logo || urlAssets?.logoUrl || ''}
            alt="Logo"
            className="w-[200px] h-[200px] mx-auto rounded-md object-contain"
          />
        ) : (
          <Skeleton className="mx-auto" variant="rectangular" sx={{ height: '200px', width: '200px' }} />
        )}
      </div>
      <button
        className="mt-6 px-6 py-3 rounded-md w-full font-bold text-white animated-button"
        style={{ backgroundColor: settings?.buttonColor || '#007bff' }}
        onClick={onContinue}
      >
        Tiếp tục để kết nối Internet
      </button>
      <p className="mt-4 font-bold text-gray-600">
        Tôi đồng ý <button className="text-blue-500 underline hover:text-blue-700">điều khoản sử dụng WIFI</button>
      </p>
    </div>
  </div>
);

const setupSubmitButton = (settings: NewDataAds, countdown: number, isEnabled = false) => {
  return (
    <button
      id={styles.submitBtn}
      style={{
        color: getContrastingColor(settings.buttonColor),
        backgroundColor: settings.buttonColor,
        cursor: isEnabled ? 'pointer' : 'not-allowed'
      }}
    >
      <b>
        {settings.buttonText ? settings.buttonText : 'Truy cập Internet'}{' '}
        <span id={styles.countdownBox}>
          (<span id={styles.countdown}>{countdown}</span>s)
        </span>
      </b>
    </button>
  );
};

function renderSocialLoginButtons(settings: NewDataAds) {
  return (
    <div id="socialLoginContainer" className={styles.socialLoginContainer}>
      {!!settings.facebook ? (
        <button id="facebookLoginBtn" className={`${styles.socialLoginBtn} ${styles.facebookBtn}`}>
          Đăng nhập bằng Facebook
        </button>
      ) : (
        ''
      )}

      {!!settings.google ? (
        <button id="googleLoginBtn" className={`${styles.socialLoginBtn} ${styles.googleBtn}`}>
          Đăng nhập bằng Google
        </button>
      ) : (
        ''
      )}

      {!!settings.twitter ? (
        <button id="twitterLoginBtn" className={`${styles.socialLoginBtn} ${styles.twitterBtn}`}>
          Đăng nhập bằng Twitter
        </button>
      ) : (
        ''
      )}
    </div>
  );
}
