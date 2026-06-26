export interface BannerAds {
  adType?: string;
  imageUrl?: string;
  imageTabletUrl?: string;
  imageDesktopUrl?: string;
  backgroundColor?: string;
  buttonColor?: string;
  buttonText?: string;
  destinationUrl?: string;
}

export interface VideoAds {
  adType?: string;
  videoUrl?: string;
  bannerUrl?: string;
  nonSkip?: boolean;
  maxLength?: number;
  backgroundColor?: string;
  destinationUrl?: string;
  nonSkipTime?: number;
  buttonText?: string;
}

export interface AdSettings {
  adType?: string;
  imageUrl?: string;
  imageTabletUrl?: string;
  imageDesktopUrl?: string;
  videoUrl?: string;
  bannerUrl?: string;
  backgroundColor?: string;
  destinationUrl?: string;
  maxLength?: number;
  nonSkip?: boolean;
  nonSkipTime?: number;
  buttonColor?: string;
  buttonText?: string;
  startTime?: string | Date | null;
  endTime?: string | Date | null;
}

export interface NewAd {
  templateName: string;
  adType: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
  placement: string;
  ssid: string;
}

export interface DataAds {
  id: number;
  ad_type: string;
  device_type: string;
  image_url: string;
  image_tablet_url: string;
  image_desktop_url: string;
  background_color: string;
  button_color: string;
  button_text: string;
  button_text_en: string;
  destination_url: string;
  video_url: string;
  banner_url: string;
  non_skip: number;
  max_length: number;
  time_start: string | Date;
  time_end: string | Date;
  ssid: string;
  placement: string;
  template_name: string;
  background_img_url: string;
  logo_img_url: string;
  status_id: number;
  fullname: string;
  BoD: string;
  gender: string;
  email: string;
  phone_number: string;
  one_click: 'true' | 'false';
  twitter: 'true' | 'false';
  facebook: 'true' | 'false';
  google: 'true' | 'false';
  layout_num: number;
  app_store_url: string;
  ch_play_url: string;
  google_analytics_key: string;
  is_enable_3rd_party?: string;
  impression_tag_3rd_party_image?: string;
  impression_tag_3rd_party_iframe?: string;
  impression_tag_3rd_party_js?: string;
  impression_tag_3rd_party_click?: string;
  is_otp_enable?: string;
  is_optional_question?: string;
  optional_question?: string;
  type_optional_answer?: string;
  optional_answer?: string | string[];
  is_optional_question_1?: string;
  optional_question_1?: string;
  type_optional_answer_1?: string;
  optional_answer_1?: string | string[];
  site_id: string,
  footer_email?: string;
  footer_phone?: string;
  title_survey?: string;
  subtitle_survey?: string;
  rating_title?: string;
  is_rating?: string;

}

export interface NewDataAds {
  adType: string;
  deviceType: string;
  imageUrl: string;
  imageTabletUrl: string;
  imageDesktopUrl: string;
  backgroundColor: string;
  buttonColor: string;
  buttonText: string;
  destinationUrl: string;
  videoUrl: string;
  bannerUrl: string;
  nonSkip: number;
  maxLength: number;
  timeStart: string | Date;
  timeEnd: string | Date;
  SSID: string;
  templateName: string;
  backgroundImgUrl: string;
  logoImgUrl: string;
  placement: string;
  fullname: string;
  BoD: string;
  email: string;
  phoneNumber: string;
  gender: string;
  layoutNum: number;
  appStoreUrl: string;
  chPlayUrl: string;
  twitter: 'true' | 'false';
  facebook: 'true' | 'false';
  google: 'true' | 'false';
  oneClick: 'true' | 'false';
  googleAnalyticsKey: string;
  isEnable3rdParty?: string;
  impressionTag3rdPartyImage?: string;
  impressionTag3rdPartyIframe?: string;
  impressionTag3rdPartyJs?: string;
  impressionTag3rdPartyClick?: string;
  isOtpEnable?: string;
  isOptionalQuestion?: string;
  optionalQuestion?: string;
  typeOptionalAnswer?: string;
  optionalAnswer?: string | string[];
  isOptionalQuestion1?: string;
  optionalQuestion1?: string;
  typeOptionalAnswer1?: string;
  optionalAnswer1?: string | string[];
  footerEmail?: string;
  footerPhone?: string;
  titleSurvey?: string
  subtitleSurvey?: string
}

export interface NewCampaign {
  id: number;
  name: string;
  adId: number;
  adPartnerId: number;
  amount: number;
  expiredDate: string | Date | null; // In $date-time format (e.g., ISO 8601)
  startDate: string | Date | null; // In $date-time format (e.g., ISO 8601)
  clickLimit: number;
  impressionDailyLimit: number;
  impressionLimit: number;
  siteId: string;
  regionId: string;
}

export interface DataCampaign {
  id: number;
  name: string;
  ad_id: number;
  ad_partner_id: number;
  amount: number;
  start_date: string;
  expired_date: string;
  click_limit: number;
  impression_limit: number;
  impression_daily_limit: number;
  site_id: string;
  region_id: string;
  status_id: number;
}

export enum AdType {
  VIDEO = 'video1',
  VIDEO_BANNER = 'video2',
  BANNER = 'banner',
  SURVEY = 'survey',
  SURVEY2 = 'survey2',
  APP = 'app',
}
