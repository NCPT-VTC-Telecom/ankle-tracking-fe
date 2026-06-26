export interface AlertsMonitoring {
    device_name: string;
    device_type: 'AP' | 'Switch';
    ip_address: string;
    location: string;
    alert_type: 'disconnect' | 'packet_loss' | 'snmp_timeout' | string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    detected_at: string;
    resolved_at?: string;
    status: 'active' | 'resolved';
}