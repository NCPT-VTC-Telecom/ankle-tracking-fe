import { useQuery } from '@tanstack/react-query';
import { userBehaviorsApi } from 'shared/api/userBehaviors.api';
import { enqueueSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { formatDateFullTime } from 'shared/utils/handleData';

// Import các interface đã định nghĩa từ file types/userBehavior.ts
import {
    DistributionChartData,
    EngagementFunnelChartData,
    EngagementOverTimeItem,
    SessionsOverTimeChartData,
    TopUser,
    UserBehaviorOverview,
    UserSegmentStat,
    UserSession
} from 'shared/types/user-behavior';

// --- PARAM INTERFACES ---

export interface ParamsUserBehavior {
    startDate?: string | Date | null;
    endDate?: string | Date | null;
    siteId?: string;
    adId?: number;
    adDataInput?: string;
}

export interface ParamsBehaviorList extends ParamsUserBehavior {
    page?: number;
    pageSize?: number;
    filters?: string;
}

// --- RESPONSE INTERFACES FOR LISTS (Hook return types) ---
interface ListResponse<T> {
    list: T[];
    total: number;
    totalPages: number;
}

// --- HOOK ---

const useHandleUserBehaviors = () => {
    const intl = useIntl();

    const showError = () => {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), { variant: 'error' });
    };

    // =================================================================
    // GROUP 1: CHARTS (/user_behaviors/chart/...)
    // =================================================================

    const useEngagementFunnel = (params: ParamsUserBehavior, enabled = true) =>
        useQuery<EngagementFunnelChartData, Error>({
            queryKey: ['chartEngagementFunnel', params],
            queryFn: async () => (await userBehaviorsApi.getChartEngagementFunnel(params)).data.data,
            enabled,
            meta: { onError: showError },
        });

    // Các chart dạng Distribution (labels + data)
    const useEventTypeDistribution = (params: ParamsUserBehavior, enabled = true) =>
        useQuery<DistributionChartData, Error>({
            queryKey: ['chartEventTypeDistribution', params],
            queryFn: async () => (await userBehaviorsApi.getChartEventTypeDistribution(params)).data.data,
            enabled,
            meta: { onError: showError },
        });

    const useHourlyActivityHeatmap = (params: ParamsUserBehavior, enabled = true) =>
        useQuery<any, Error>({ // Chưa có mẫu JSON cụ thể, tạm để any hoặc dùng DistributionChartData nếu cấu trúc giống
            queryKey: ['chartHourlyActivityHeatmap', params],
            queryFn: async () => (await userBehaviorsApi.getChartHourlyActivityHeatmap(params)).data.data,
            enabled,
            meta: { onError: showError },
        });

    const useLanguageDistribution = (params: ParamsUserBehavior, enabled = true) =>
        useQuery<DistributionChartData, Error>({
            queryKey: ['chartLanguageDistribution', params],
            queryFn: async () => (await userBehaviorsApi.getChartLanguageDistribution(params)).data.data,
            enabled,
            meta: { onError: showError },
        });

    const usePlatformDistribution = (params: ParamsUserBehavior, enabled = true) =>
        useQuery<DistributionChartData, Error>({
            queryKey: ['chartPlatformDistribution', params],
            queryFn: async () => (await userBehaviorsApi.getChartPlatformDistribution(params)).data.data,
            enabled,
            meta: { onError: showError },
        });

    const useScreenResolutionDistribution = (params: ParamsUserBehavior, enabled = true) =>
        useQuery<DistributionChartData, Error>({
            queryKey: ['chartScreenResolutionDistribution', params],
            queryFn: async () => (await userBehaviorsApi.getChartScreenResolutionDistribution(params)).data.data,
            enabled,
            meta: { onError: showError },
        });

    const useSessionsOverTime = (params: ParamsUserBehavior, enabled = true) =>
        useQuery<SessionsOverTimeChartData, Error>({
            queryKey: ['chartSessionsOverTime', params],
            queryFn: async () => (await userBehaviorsApi.getChartSessionsOverTime(params)).data.data,
            enabled,
            meta: { onError: showError },
        });

    const useTopPagesVisited = (params: ParamsBehaviorList, enabled = true) =>
        useQuery<DistributionChartData, Error>({
            queryKey: ['chartTopPagesVisited', params],
            queryFn: async () => (await userBehaviorsApi.getChartTopPagesVisited(params)).data.data,
            enabled,
            meta: { onError: showError },
        });

    const useUserSegmentDistribution = (params: ParamsUserBehavior, enabled = true) =>
        useQuery<DistributionChartData, Error>({
            queryKey: ['chartUserSegmentDistribution', params],
            queryFn: async () => (await userBehaviorsApi.getChartUserSegmentDistribution(params)).data.data,
            enabled,
            meta: { onError: showError },
        });

    const useVisitFrequencyDistribution = (params: ParamsUserBehavior, enabled = true) =>
        useQuery<DistributionChartData, Error>({
            queryKey: ['chartVisitFrequencyDistribution', params],
            queryFn: async () => (await userBehaviorsApi.getChartVisitFrequencyDistribution(params)).data.data,
            enabled,
            meta: { onError: showError },
        });

    // =================================================================
    // GROUP 2: STATS (/user_behaviors/stats/...)
    // =================================================================

    const useStatsDevices = (params: ParamsUserBehavior, enabled = true) =>
        useQuery<any, Error>({ // Chưa có mẫu JSON
            queryKey: ['statsDevices', params],
            queryFn: async () => (await userBehaviorsApi.getStatsDevices(params)).data.data,
            enabled,
            meta: { onError: showError },
        });

    const useStatsEngagementOverTime = (params: ParamsUserBehavior, enabled = true) =>
        useQuery<EngagementOverTimeItem[], Error>({
            queryKey: ['statsEngagementOverTime', params],
            queryFn: async () => (await userBehaviorsApi.getStatsEngagementOverTime(params)).data.data,
            enabled,
            meta: { onError: showError },
        });

    const useStatsEventTypes = (params: ParamsUserBehavior, enabled = true) =>
        useQuery<any, Error>({ // Chưa có mẫu JSON
            queryKey: ['statsEventTypes', params],
            queryFn: async () => (await userBehaviorsApi.getStatsEventTypes(params)).data.data,
            enabled,
            meta: { onError: showError },
        });

    const useStatsUserSegments = (params: ParamsBehaviorList, enabled = true) =>
        useQuery<UserSegmentStat[], Error>({
            queryKey: ['statsUserSegments', params],
            queryFn: async () => (await userBehaviorsApi.getStatsUserSegments(params)).data.data,
            enabled,
            meta: { onError: showError },
        });

    // =================================================================
    // GROUP 3: GENERAL & LISTS (/user_behaviors/...)
    // =================================================================

    // /user_behaviors/overview
    const useOverview = (params: ParamsUserBehavior, enabled = true) =>
        useQuery<UserBehaviorOverview, Error>({
            queryKey: ['behaviorOverview', params],
            queryFn: async () => (await userBehaviorsApi.getOverview(params)).data.data,
            enabled,
            meta: { onError: showError },
        });

    // /user_behaviors/sessions
    const useSessions = (params: ParamsBehaviorList, enabled = true) =>
        useQuery<ListResponse<UserSession>, Error>({
            queryKey: ['behaviorSessions', params],
            queryFn: async () => {
                const { data } = await userBehaviorsApi.getSessions(params);
                // Format date nếu cần thiết
                const formatted = formatDateFullTime(data.data, ['created_date', 'start_time', 'end_time', 'session_start', 'session_end']);
                return { list: formatted, total: data.pagination?.total || 0, totalPages: data.pagination?.totalPages || 0 };
            },
            enabled,
            meta: { onError: showError },
        });

    // /user_behaviors/top_users
    const useTopUsers = (params: ParamsBehaviorList, enabled = true) =>
        useQuery<ListResponse<TopUser>, Error>({
            queryKey: ['behaviorTopUsers', params],
            queryFn: async () => {
                const { data } = await userBehaviorsApi.getTopUsers(params);
                // API trả về mảng trực tiếp trong data.data (theo mẫu JSON bạn gửi), 
                // nhưng thường list sẽ kèm total. Nếu API chỉ trả mảng data mà không có pagination wrapper:
                const listData = Array.isArray(data.data) ? data.data : [];
                // Giả định nếu API trả mảng list thì total lấy length hoặc từ header (tùy BE)
                // Ở đây mình map theo cấu trúc ListResponse đã define
                return {
                    list: listData,
                    total: data.total || listData.length,
                    totalPages: data.totalPages || 1
                };
            },
            enabled,
            meta: { onError: showError },
        });

    // /user_behaviors/tracking_events
    const useTrackingEvents = (params: ParamsBehaviorList, enabled = true) =>
        useQuery<ListResponse<any>, Error>({ // Chưa có interface TrackingEvent cụ thể
            queryKey: ['behaviorTrackingEvents', params],
            queryFn: async () => {
                const { data } = await userBehaviorsApi.getTrackingEvents(params);
                return { list: data.data, total: data.total, totalPages: data.totalPages };
            },
            enabled,
            meta: { onError: showError },
        });

    return {
        // Charts
        useEngagementFunnel,
        useEventTypeDistribution,
        useHourlyActivityHeatmap,
        useLanguageDistribution,
        usePlatformDistribution,
        useScreenResolutionDistribution,
        useSessionsOverTime,
        useTopPagesVisited,
        useUserSegmentDistribution,
        useVisitFrequencyDistribution,
        // Stats
        useStatsDevices,
        useStatsEngagementOverTime,
        useStatsEventTypes,
        useStatsUserSegments,
        // General
        useOverview,
        useSessions,
        useTopUsers,
        useTrackingEvents,
    };
};

export default useHandleUserBehaviors;