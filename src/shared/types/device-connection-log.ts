export enum DeviceSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export enum DeviceSolveStatus {
    UNRESOLVED = 'UNRESOLVED',
    RESOLVED = 'RESOLVED',
}

export interface DeviceConnectionLog {
    id: string;
    device_id: string;
    device_name: string;
    device_ip: string;
    device_mac: string;
    region_id: string;
    region_name: string;
    site_id: string;
    previous_status_id: number;
    current_status_id: number;
    connection_status: ConnectionStatus;
    details?: string;
    error_message?: string;
    scan_type: ScanType;
    logged_at: string;
    solve_status: DeviceSolveStatus;
    severity: DeviceSeverity;
}

export interface PaginationInfo {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export interface FilterOptionsResponse {
    code: number;
    message: string;
    data: {
        regions: RegionOption[];
        devices: DeviceOption[];
        connectionStatuses: FilterOption[];
        scanTypes: FilterOption[];
        datePresets: FilterOption[];
    };
}

export interface FilterOption {
    value: string;
    label: string;
    color?: string;
}

export interface RegionOption {
    id: string;
    name: string;
    sites: SiteOption[];
}

export interface SiteOption {
    id: string;
    name: string;
}

export interface DeviceOption {
    id: string;
    name: string;
    ip: string;
    label: string;
}

// Types
export type ConnectionStatus =
    | "CONNECTED"
    | "DISCONNECTED"
    | "RECONNECTED"
    | "TIMEOUT"
    | "ERROR"
    | "HEARTBEAT_MISSED";

export type ScanType =
    | "GENERAL_SCAN"
    | "CONTROLLER_CHECK"
    | "MANUAL_CHECK"
    | "HEARTBEAT";
