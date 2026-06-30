import {
  Building,
  ChartSquare,
  Danger,
  Gps,
  House2,
  Location,
  Lock,
  Personalcard,
  Profile2User,
  Shield,
  ShieldTick,
  Verify
} from 'iconsax-react';
import homeBeaconImg from 'assets/images/g737-home-beacon.png';
import ankleTrackerImg from 'assets/images/gosafe-g737-offender-tracker-1.png';

export const features = [
  {
    icon: <Gps size={32} variant="Bold" />,
    titleKey: 'landing.features.wifi.title',
    defaultTitle: 'Giám sát GPS thời gian thực',
    descKey: 'landing.features.wifi.desc',
    defaultDesc: 'Định vị chính xác vị trí đối tượng theo thời gian thực trên bản đồ số, kết hợp GPS/LBS/WiFi để bám vết liên tục.'
  },
  {
    icon: <ChartSquare size={32} variant="Bold" />,
    titleKey: 'landing.features.analytics.title',
    defaultTitle: 'Báo cáo & Thống kê',
    descKey: 'landing.features.analytics.desc',
    defaultDesc: 'Báo cáo chi tiết lịch sử di chuyển, vi phạm và tình trạng thiết bị. Xuất báo cáo định kỳ.'
  },
  {
    icon: <Shield size={32} variant="Bold" />,
    titleKey: 'landing.features.security.title',
    defaultTitle: 'Chống tháo gỡ & Bảo mật',
    descKey: 'landing.features.security.desc',
    defaultDesc: 'Phát hiện và cảnh báo tức thì khi đối tượng cố tháo gỡ hoặc phá thiết bị. Dữ liệu mã hóa, máy chủ tại Việt Nam.'
  },
  {
    icon: <Danger size={32} variant="Bold" />,
    titleKey: 'landing.features.marketing.title',
    defaultTitle: 'Cảnh báo vi phạm tức thì',
    descKey: 'landing.features.marketing.desc',
    defaultDesc: 'Tự động phát cảnh báo khi đối tượng ra khỏi vùng giám sát, vi phạm giới nghiêm hoặc mất tín hiệu.'
  },
  {
    icon: <Location size={32} variant="Bold" />,
    titleKey: 'landing.features.location.title',
    defaultTitle: 'Vùng giám sát (Geofence)',
    descKey: 'landing.features.location.desc',
    defaultDesc: 'Thiết lập linh hoạt vùng cho phép/cấm theo từng đối tượng. Cảnh báo ngay khi ra/vào vùng không hợp lệ.'
  },
  {
    icon: <Personalcard size={32} variant="Bold" />,
    titleKey: 'landing.features.integration.title',
    defaultTitle: 'Quản lý hồ sơ & Tuân thủ',
    descKey: 'landing.features.integration.desc',
    defaultDesc: 'Quản lý hồ sơ đối tượng, lịch trình bắt buộc và hồ sơ thi hành án tập trung, đúng quy định pháp luật.'
  }
];

export const useCases: any = [
  {
    titleKey: 'landing.solutions.airport',
    titleDefault: 'Quản lý tại gia & Cấm cư trú',
    descKey: 'landing.solutions.airport.desc',
    descDefault: 'Giám sát đối tượng bị quản chế tại gia, cảnh báo khi rời khỏi nơi cư trú được phép.',
    metricsKey: 'landing.solutions.airport.metrics',
    metricsDefault: 'Giám sát 24/7 theo thời gian thực',
    icon: <House2 variant="Bold" />,
    imageUrl: homeBeaconImg
  },
  {
    titleKey: 'landing.solutions.hotel',
    titleDefault: 'Án treo & Tha tù trước thời hạn',
    descKey: 'landing.solutions.hotel.desc',
    descDefault: 'Theo dõi đối tượng được hưởng án treo, tha tù có điều kiện, đảm bảo tuân thủ cam kết.',
    metricsKey: 'landing.solutions.hotel.metrics',
    metricsDefault: 'Giảm tải nhân lực giám sát',
    icon: <Profile2User variant="Bold" />,
    imageUrl: ankleTrackerImg
  },
  {
    titleKey: 'landing.solutions.retail',
    titleDefault: 'Cấm tiếp xúc & Vùng cấm',
    descKey: 'landing.solutions.retail.desc',
    descDefault: 'Thiết lập vùng cấm quanh nạn nhân/khu vực nhạy cảm, cảnh báo khi đối tượng tới gần.',
    metricsKey: 'landing.solutions.retail.metrics',
    metricsDefault: 'Cảnh báo vi phạm tức thì',
    icon: <Location variant="Bold" />,
    imageUrl: '/images/Flexible-Geofence---Offender-Tracking-System.png'
  },
  {
    titleKey: 'landing.solutions.office',
    titleDefault: 'Đối tượng nguy cơ cao',
    descKey: 'landing.solutions.office.desc',
    descDefault: 'Bám vết liên tục, chống tháo gỡ và cảnh báo nhiều lớp cho nhóm đối tượng cần giám sát chặt.',
    metricsKey: 'landing.solutions.office.metrics',
    metricsDefault: 'Chống tháo gỡ, cảnh báo đa lớp',
    icon: <Danger variant="Bold" />,
    imageUrl: '/images/Various-Alarms-setting---Offender-Tracking-System.png'
  },
  {
    titleKey: 'landing.solutions.education',
    titleDefault: 'Cơ quan thi hành án',
    descKey: 'landing.solutions.education.desc',
    descDefault: 'Quản lý tập trung toàn bộ đối tượng, hồ sơ, lịch trình và báo cáo trên một nền tảng duy nhất.',
    metricsKey: 'landing.solutions.education.metrics',
    metricsDefault: 'Quản lý tập trung, minh bạch',
    icon: <Building variant="Bold" />,
    imageUrl: '/images/One-stop-solution-for-offenders-tracking.png'
  }
];

export const comparisonData = [
  {
    featureKey: 'landing.comparison.feature.centralized',
    featureDefault: 'Quản lý tập trung',
    traditionalKey: 'landing.comparison.traditional.centralized',
    traditionalDefault: 'Hạn chế / Cục bộ',
    wifiDigitalKey: 'landing.comparison.digital.centralized',
    wifiDigitalDefault: 'Cloud / On-premise toàn diện',
    highlight: true
  },
  {
    featureKey: 'landing.comparison.feature.marketing',
    featureDefault: 'WiFi Marketing',
    traditionalKey: 'landing.comparison.traditional.marketing',
    traditionalDefault: 'Cơ bản / Không có',
    wifiDigitalKey: 'landing.comparison.digital.marketing',
    wifiDigitalDefault: 'Đa dạng, Tùy biến cao',
    highlight: true
  },
  {
    featureKey: 'landing.comparison.feature.indoor',
    featureDefault: 'Định vị Indoor',
    traditionalKey: 'landing.comparison.traditional.indoor',
    traditionalDefault: 'Không có',
    wifiDigitalKey: 'landing.comparison.digital.indoor',
    wifiDigitalDefault: 'Chính xác < 2m',
    highlight: true
  },
  {
    featureKey: 'landing.comparison.feature.analytics',
    featureDefault: 'Báo cáo & Analytics',
    traditionalKey: 'landing.comparison.traditional.analytics',
    traditionalDefault: 'Cơ bản',
    wifiDigitalKey: 'landing.comparison.digital.analytics',
    wifiDigitalDefault: 'Chuyên sâu & Real-time',
    highlight: true
  },
  {
    featureKey: 'landing.comparison.feature.integration',
    featureDefault: 'Tích hợp hệ thống',
    traditionalKey: 'landing.comparison.traditional.integration',
    traditionalDefault: 'Khó khăn',
    wifiDigitalKey: 'landing.comparison.digital.integration',
    wifiDigitalDefault: 'API mở, Dễ dàng',
    highlight: true
  }
];

export const certificationsList = [
  {
    name: 'ISO 27001',
    descKey: 'landing.certifications.iso.desc',
    descDefault: 'An toàn thông tin',
    icon: <ShieldTick variant="Bold" />
  },
  { name: 'Mã hóa dữ liệu', descKey: 'landing.certifications.gdpr.desc', descDefault: 'Bảo vệ dữ liệu cá nhân', icon: <Verify variant="Bold" /> },
  { name: 'Lưu trữ tại VN', descKey: 'landing.certifications.soc.desc', descDefault: 'Máy chủ tại Việt Nam', icon: <Lock variant="Bold" /> },
  { name: 'Tuân thủ pháp luật', descKey: 'landing.certifications.pci.desc', descDefault: 'Quy định hiện hành', icon: <Shield variant="Bold" /> }
];

export const benefits = [
  {
    key: 'landing.benefits.cost',
    default: 'Tiết kiệm 40% chi phí vận hành hệ thống WiFi'
  },
  {
    key: 'landing.benefits.deploy',
    default: 'Triển khai nhanh 1-2 ngày, không gián đoạn'
  },
  {
    key: 'landing.benefits.support',
    default: 'Hỗ trợ 24/7 bởi đội ngũ VTC Telecom'
  },
  {
    key: 'landing.benefits.marketing',
    default: 'Tích hợp WiFi Marketing thu hút khách hàng'
  },
  {
    key: 'landing.benefits.analytics',
    default: 'Báo cáo và phân tích dữ liệu chi tiết'
  },
  {
    key: 'landing.benefits.security',
    default: 'Bảo mật đạt chuẩn ISO 27001'
  },
  {
    key: 'landing.benefits.firmware',
    default: 'Tự động cập nhật firmware, tính năng mới'
  },
  {
    key: 'landing.benefits.scalable',
    default: 'Mở rộng không giới hạn thiết bị, người dùng'
  }
];

export const faqs = [
  {
    questionKey: 'landing.faq.q1',
    questionDefault: 'WiFi Digital có tương thích với thiết bị WiFi hiện có không?',
    answerKey: 'landing.faq.a1',
    answerDefault:
      'Có, WiFi Digital hỗ trợ hầu hết các hãng thiết bị WiFi phổ biến trên thị trường như TP-Link, Aruba, Ruckus, Unifi, v.v. thông qua các giao thức chuẩn.'
  },
  {
    questionKey: 'landing.faq.q2',
    questionDefault: 'Tôi có thể dùng thử giải pháp không?',
    answerKey: 'landing.faq.a2',
    answerDefault: 'Chúng tôi cung cấp gói dùng thử miễn phí 30 ngày với đầy đủ tính năng để bạn trải nghiệm hiệu quả thực tế.'
  },
  {
    questionKey: 'landing.faq.q3',
    questionDefault: 'Dữ liệu người dùng được bảo mật như thế nào?',
    answerKey: 'landing.faq.a3',
    answerDefault:
      'Chúng tôi tuân thủ nghiêm ngặt tiêu chuẩn ISO 27001 và GDPR. Dữ liệu được mã hóa đầu cuối và lưu trữ an toàn tại Data Center đạt chuẩn Tier 3.'
  },
  {
    questionKey: 'landing.faq.q4',
    questionDefault: 'Chi phí triển khai được tính như thế nào?',
    answerKey: 'landing.faq.a4',
    answerDefault:
      'Chi phí linh hoạt dựa trên số lượng Access Points và các module tính năng bạn chọn. Liên hệ chúng tôi để nhận báo giá chi tiết.'
  }
];

export const faqsGosafe = [
  {
    questionKey: 'gosafe-faq-q1',
    questionDefault: 'How GPS Ankle Bracelets for Prisoners Work?',
    answerKey: 'gosafe-faq-a1',
    answerDefault:
      "GPS ankle bracelets for prisoners are electronic monitoring devices that track an individual's location in real-time. These bracelets use GPS technology to communicate with a central monitoring system, providing authorities with the wearer's exact location and movement history. They are typically worn by individuals on parole, probation, or house arrest, allowing law enforcement to ensure compliance with court-ordered restrictions, such as staying within designated areas or avoiding certain locations. If the wearer tries to tamper with or remove the device, it sends an alert to authorities. This technology offers a way to monitor offenders while allowing some degree of freedom."
  },
  {
    questionKey: 'gosafe-faq-q2',
    questionDefault: 'Do you have other products?',
    answerKey: 'gosafe-faq-a2',
    answerDefault: 'Click here to discover the full range of GPS tracking solutions.'
  },
  {
    questionKey: 'gosafe-faq-q3',
    questionDefault: 'Features to Consider When Choosing a Prisoner Tracking Bracelet',
    answerKey: 'gosafe-faq-a3',
    answerDefault:
      'When choosing a prisoner tracking bracelet, important features to consider include GPS accuracy, battery life, and tamper-resistance. The GPS should offer precise location tracking, even in areas with weak signals, to ensure reliable monitoring. Long battery life is crucial for continuous monitoring without frequent recharges, which could pose a risk of non-compliance. Tamper-resistant design with strong materials and alerts for attempted removal or interference enhances security. Additional features like two-way communication, customizable geofencing zones, and integration with law enforcement systems can also improve functionality, making it easier to manage and track offenders effectively. Read further: Top Features to Consider When Choosing a Prisoner Tracking Bracelet'
  },
  {
    questionKey: 'gosafe-faq-q4',
    questionDefault: 'How often does the ankle bracelet GPS tracker track?',
    answerKey: 'gosafe-faq-a4',
    answerDefault:
      'The ankle bracelet GPS tracker devices can easily be configured to respective intervals based on the needs. It can report different intervals when static and in motion.'
  },
  {
    questionKey: 'gosafe-faq-q5',
    questionDefault: 'Is there a secondary antenna associated with the ankle bracelet GPS tracker device?',
    answerKey: 'gosafe-faq-a5',
    answerDefault: 'Depending on the model there are options available for secondary GPS antenna'
  },
  {
    questionKey: 'gosafe-faq-q6',
    questionDefault: 'What happens if you take off a GPS tracking bracelet for prisoners?',
    answerKey: 'gosafe-faq-a6',
    answerDefault:
      'Removing or tampering with a GPS ankle monitor is typically considered a violation of the terms of house arrest, probation, parole, or pretrial release. The potential consequence is an immediate alert. GPS ankle monitors are designed to notify authorities as soon as the device is tampered with or removed. This alert is usually sent in real-time.'
  },
  {
    questionKey: 'gosafe-faq-q7',
    questionDefault: 'How long does a GPS tracking bracelet for prisoners last?',
    answerKey: 'gosafe-faq-a7',
    answerDefault:
      "Battery Life: GPS tracking bracelets for prisoners last between 24 to 72 hours on a full charge. They may last up to 5 days depending on the device's settings and how frequently it transmits location data.\n\nCharging Frequency: They require daily or every-other-day charging to ensure they stay functional. Failing to charge the GPS tracking bracelet can trigger an alert to authorities.\n\nCharging Method: GPS tracking bracelets come with a charging unit that allows the wearer to charge the device without needing to remove it."
  }
];
