import { EndUserData } from "./end-user";

export interface Agent {
    id: number; // ID của đại lý
    agent_name: string; // Tên đại lý
    token: string; // Token xác thực của đại lý
    expiry_date: string; // ISO 8601 date-time: Ngày hết hạn của đại lý
    user_id: string; // UUID: ID của user quản lý đại lý
    status_id: number; // ID trạng thái của đại lý
    created_date: string; // ISO 8601 date-time: Ngày tạo đại lý
    modified_date: string; // ISO 8601 date-time: Ngày cập nhật cuối cùng
    user: EndUserData
}