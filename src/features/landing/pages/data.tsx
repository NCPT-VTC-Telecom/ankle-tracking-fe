import {
  Airplane,
  Building,
  ChartSquare,
  Diagram,
  House2,
  Location,
  Lock,
  Mobile,
  Shield,
  ShieldTick,
  Shop,
  Teacher,
  Verify,
  Wifi
} from 'iconsax-react';
import tplinkLogo from 'assets/images/logos/tp-link.png';
import arubaLogo from 'assets/images/logos/aruba.png';
import ruckusLogo from 'assets/images/logos/ruckus.png';
import unifiLogo from 'assets/images/logos/unifi.png';
import salesforceLogo from 'assets/images/logos/salesforce.png';
import microsoftLogo from 'assets/images/logos/microsoft.png';
import googleLogo from 'assets/images/logos/google.png';
import oracleLogo from 'assets/images/logos/oracle.png';
import airportImg from 'assets/images/airport.png';
import hotelImg from 'assets/images/hotel.png';
import retailImg from 'assets/images/retail.png';
import officeImg from 'assets/images/office.png';
import educationImg from 'assets/images/education.png';

export const features = [
  {
    icon: <Wifi size={32} variant="Bold" />,
    titleKey: 'landing.features.wifi.title',
    defaultTitle: 'Quản lý WiFi Tập trung',
    descKey: 'landing.features.wifi.desc',
    defaultDesc: 'Giám sát và cấu hình hàng nghìn Access Points từ một dashboard duy nhất. Tự động tối ưu hóa sóng và băng thông.'
  },
  {
    icon: <ChartSquare size={32} variant="Bold" />,
    titleKey: 'landing.features.analytics.title',
    defaultTitle: 'Analytics & Reporting',
    descKey: 'landing.features.analytics.desc',
    defaultDesc: 'Báo cáo chi tiết về lưu lượng, hành vi người dùng, và hiệu suất mạng. Xuất báo cáo tự động định kỳ.'
  },
  {
    icon: <Shield size={32} variant="Bold" />,
    titleKey: 'landing.features.security.title',
    defaultTitle: 'Bảo mật Nâng cao',
    descKey: 'landing.features.security.desc',
    defaultDesc: 'Phát hiện và ngăn chặn xâm nhập (WIPS). Tách biệt mạng khách và nội bộ. Xác thực người dùng đa lớp.'
  },
  {
    icon: <Mobile size={32} variant="Bold" />,
    titleKey: 'landing.features.marketing.title',
    defaultTitle: 'WiFi Marketing',
    descKey: 'landing.features.marketing.desc',
    defaultDesc: 'Tùy biến trang chào (Splash Page), thu thập thông tin khách hàng, tích hợp quảng cáo và khảo sát.'
  },
  {
    icon: <Location size={32} variant="Bold" />,
    titleKey: 'landing.features.location.title',
    defaultTitle: 'Định vị & Bản đồ số',
    descKey: 'landing.features.location.desc',
    defaultDesc: 'Theo dõi vị trí thiết bị thời gian thực trên bản đồ số. Heatmap mật độ người dùng.'
  },
  {
    icon: <Diagram size={32} variant="Bold" />,
    titleKey: 'landing.features.integration.title',
    defaultTitle: 'Tích hợp Hệ thống',
    descKey: 'landing.features.integration.desc',
    defaultDesc: 'API mở sẵn sàng tích hợp với CRM, ERP, PMS (Hotel), và các hệ thống quản trị khác.'
  }
];

export const integrations: any = [
  {
    categoryKey: 'landing.integrations.category.hardware',
    categoryDefault: 'Hardware Partners',
    descKey: 'landing.integrations.category.hardware.desc',
    descDefault: 'Quản lý và đồng bộ dữ liệu hardware partners liền mạch.',
    partners: [
      { name: 'TP-Link', logo: tplinkLogo, description: 'Enterprise Networking' },
      { name: 'Aruba', logo: arubaLogo, description: 'Secure Mobility' },
      { name: 'Ruckus', logo: ruckusLogo, description: 'High Performance' },
      { name: 'Unifi', logo: unifiLogo, description: 'Ubiquiti Networks' }
    ]
  },
  {
    categoryKey: 'landing.integrations.category.software',
    categoryDefault: 'Software Integrations',
    descKey: 'landing.integrations.category.software.desc',
    descDefault: 'Quản lý và đồng bộ dữ liệu software integrations liền mạch.',
    partners: [
      { name: 'Salesforce', logo: salesforceLogo, description: 'CRM Integration' },
      { name: 'Microsoft', logo: microsoftLogo, description: 'Azure AD / 365' },
      { name: 'Google', logo: googleLogo, description: 'Analytics & Auth' },
      { name: 'Oracle', logo: oracleLogo, description: 'Opera PMS' }
    ]
  }
];

export const useCases: any = [
  {
    titleKey: 'landing.solutions.airport',
    titleDefault: 'Sân bay & Giao thông công cộng',
    descKey: 'landing.solutions.airport.desc',
    descDefault: 'WiFi tốc độ cao, định tuyến thông minh, quảng cáo theo vị trí & hành trình.',
    metricsKey: 'landing.solutions.airport.metrics',
    metricsDefault: 'Phục vụ 50.000+ lượt kết nối/ngày',
    icon: <Airplane variant="Bold" />,
    imageUrl: airportImg
  },
  {
    titleKey: 'landing.solutions.hotel',
    titleDefault: 'Khách sạn & Resort',
    descKey: 'landing.solutions.hotel.desc',
    descDefault: 'Tích hợp PMS, trang chào cá nhân hóa, quản lý băng thông theo hạng phòng.',
    metricsKey: 'landing.solutions.hotel.metrics',
    metricsDefault: 'Tăng 20% doanh thu dịch vụ',
    icon: <House2 variant="Bold" />,
    imageUrl: hotelImg
  },
  {
    titleKey: 'landing.solutions.retail',
    titleDefault: 'Chuỗi bán lẻ & TTTM',
    descKey: 'landing.solutions.retail.desc',
    descDefault: 'Phân tích hành vi mua sắm, heatmap khách hàng, đẩy quảng cáo đúng ngữ cảnh.',
    metricsKey: 'landing.solutions.retail.metrics',
    metricsDefault: 'Tăng 15% tỷ lệ quay lại',
    icon: <Shop variant="Bold" />,
    imageUrl: retailImg
  },
  {
    titleKey: 'landing.solutions.office',
    titleDefault: 'Văn phòng & Tòa nhà',
    descKey: 'landing.solutions.office.desc',
    descDefault: 'Bảo mật cấp doanh nghiệp, xác thực 802.1x, quản lý thiết bị BYOD.',
    metricsKey: 'landing.solutions.office.metrics',
    metricsDefault: 'Giảm 40% ticket IT',
    icon: <Building variant="Bold" />,
    imageUrl: officeImg
  },
  {
    titleKey: 'landing.solutions.education',
    titleDefault: 'Giáo dục & Trường học',
    descKey: 'landing.solutions.education.desc',
    descDefault: 'Lọc nội dung, quản lý truy cập theo giờ, hỗ trợ thi trực tuyến ổn định.',
    metricsKey: 'landing.solutions.education.metrics',
    metricsDefault: '100% kiểm soát truy cập',
    icon: <Teacher variant="Bold" />,
    imageUrl: educationImg
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
    descDefault: 'Information Security',
    icon: <ShieldTick variant="Bold" />
  },
  { name: 'GDPR Ready', descKey: 'landing.certifications.gdpr.desc', descDefault: 'Data Protection', icon: <Verify variant="Bold" /> },
  { name: 'SOC 2 Type II', descKey: 'landing.certifications.soc.desc', descDefault: 'Service Organization', icon: <Lock variant="Bold" /> },
  { name: 'PCI DSS', descKey: 'landing.certifications.pci.desc', descDefault: 'Payment Security', icon: <Shield variant="Bold" /> }
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
