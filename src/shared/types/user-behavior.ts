// Interface cho phần Overview
export interface UserBehaviorOverview {
    totalEvents: number;
    totalSessions: number;
    totalUniqueUsers: number;
    avgSessionDuration: number;
    totalClicks: number;
    totalScrolls: number;
}

// Interface cho từng item trong mảng Engagement Over Time
export interface EngagementOverTimeItem {
    period: string;        // "2025-11-13"
    sessions: number;      // 2
    unique_users: number;  // 1
    clicks: string;        // "2" (API trả về string)
    scrolls: string;       // "0" (API trả về string)
    avg_duration: number | null; // 5, 6 hoặc null
}

// Dạng dữ liệu trả về cho biểu đồ (nếu API trả về cả mảng)
export type EngagementOverTimeData = EngagementOverTimeItem[];


// Dùng cho: user_behaviors/chart/sessions_over_time
export interface SessionsOverTimeChartData {
    labels: string[];       // ["2025-11-13", "2025-11-14", ...]
    sessions: number[];     // [2, 25, ...]
    uniqueUsers: number[];  // [1, 2, ...]
    clicks: number[];       // [2, 24, ...]
    scrolls: number[];      // [0, 0, ...]
    avgDuration: number[];  // [0, 0, 5, 6]
}

// Dùng chung cho:
// - user_behaviors/chart/event_type_distribution
// - user_behaviors/chart/platform_distribution
// - user_behaviors/chart/language_distribution
export interface DistributionChartData {
    labels: string[]; // ["user_idle", "page_load"] hoặc ["Android", "iOS"]
    data: number[];   // [38, 34] hoặc [1, 1]
}

// Dùng cho: user_behaviors/chart/engagement_funnel
export interface EngagementFunnelChartData {
    stages: string[]; // ["Sessions", "With Clicks", ...]
    counts: number[]; // [33, 31, ...]
}

// ==========================================
// 2. STATS INTERFACES
// ==========================================

// Dùng cho: /user_behaviors/stats/user_segments
export interface UserSegmentStat {
    segment: string;              // "new", "casual"
    count: number;                // 2
    avg_clicks: number;           // 0.9375
    avg_duration: number | null;  // 5.5 hoặc null
}

// ==========================================
// 3. LIST & ENTITY INTERFACES
// ==========================================

// Dùng cho: user_behaviors/top_users
export interface TopUser {
    id: string;
    device_fingerprint: string;
    mac_address_client: string | null;
    first_seen: string;           // ISO Date string
    last_seen: string;            // ISO Date string
    total_visits: number;
    total_session_duration: number;
    average_session_duration: number | null;
    total_clicks: number;
    total_video_views: number;
    total_form_submissions: number;
    current_segment: string | null; // "new" hoặc null
    segment_history: string | null;
    peak_visit_hours: string;     // JSON string "[]"
    peak_visit_days: string;      // JSON string "[]"
    average_gap_days: number | null;
    bounce_rate: number;
    preferred_ad_types: string | null;
    conversion_rate: number | null;
    created_at: string;
    updated_at: string;
}

// Dùng cho: user_behaviors/sessions (Object đơn lẻ trong mảng data)
export interface UserSession {
    id: string;
    session_id: string;
    device_fingerprint: string;
    mac_address_client: string | null;
    ad_id: number;
    ad_type: string;              // "survey", "banner"
    ssid: string;
    ap_mac: string | null;
    session_start: string;        // ISO Date string
    session_end: string | null;   // ISO Date string hoặc null
    session_duration: number | null;
    is_returning_user: boolean;
    visit_number: number;
    user_segment: string;         // "new", "casual"
    total_clicks: number;
    total_scrolls: number;
    max_scroll_depth: number;
    video_views: number;
    form_submissions: number;
    device_info: string;          // JSON string chứa userAgent, platform...
    created_at: string;
    updated_at: string;
}

// Dùng cho response trả về của API sessions (có phân trang)
export interface Pagination {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface SessionsListResponse {
    code: number;
    message: string;
    data: UserSession[];
    pagination: Pagination;
}