export interface GeoQueryParams {
    level?: 1 | 2 | 3;
    countryCode?: string;
    parentId?: string | number;
    name?: string;
    page?: number;
    pageSize?: number;
}

export interface GeoItem {
    id: string | number;
    name: string;
    code?: string;
    level?: number;
    parent_id?: number | string;
}