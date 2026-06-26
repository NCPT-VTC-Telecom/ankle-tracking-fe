import { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';

export const userBehaviorsApi = {
    // =================================================================
    // GROUP: CHARTS (/user_behaviors/chart/...)
    // =================================================================

    getChartEngagementFunnel: (params: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/user_behaviors/chart/engagement_funnel',
            params,
        }),

    getChartEventTypeDistribution: (params: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/user_behaviors/chart/event_type_distribution',
            params,
        }),

    getChartHourlyActivityHeatmap: (params: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/user_behaviors/chart/hourly_activity_heatmap',
            params,
        }),

    getChartLanguageDistribution: (params: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/user_behaviors/chart/language_distribution',
            params,
        }),

    getChartPlatformDistribution: (params: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/user_behaviors/chart/platform_distribution',
            params,
        }),

    getChartScreenResolutionDistribution: (params: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/user_behaviors/chart/screen_resolution_distribution',
            params,
        }),

    getChartSessionsOverTime: (params: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/user_behaviors/chart/sessions_over_time',
            params,
        }),

    getChartTopPagesVisited: (params: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/user_behaviors/chart/top_pages_visited',
            params,
        }),

    getChartUserSegmentDistribution: (params: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/user_behaviors/chart/user_segment_distribution',
            params,
        }),

    getChartVisitFrequencyDistribution: (params: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/user_behaviors/chart/visit_frequency_distribution',
            params,
        }),

    // =================================================================
    // GROUP: GENERAL & LISTS (/user_behaviors/...)
    // =================================================================

    getOverview: (params: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/user_behaviors/overview',
            params,
        }),

    getSessions: (params: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/user_behaviors/sessions',
            params,
        }),

    getTopUsers: (params: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/user_behaviors/top_users',
            params,
        }),

    getTrackingEvents: (params: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/user_behaviors/tracking_events',
            params,
        }),

    // =================================================================
    // GROUP: STATS (/user_behaviors/stats/...)
    // =================================================================

    getStatsDevices: (params: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/user_behaviors/stats/devices',
            params,
        }),

    getStatsEngagementOverTime: (params: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/user_behaviors/stats/engagement_over_time',
            params,
        }),

    getStatsEventTypes: (params: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/user_behaviors/stats/event_types',
            params,
        }),

    getStatsUserSegments: (params: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/user_behaviors/stats/user_segments',
            params,
        }),
};