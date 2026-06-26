export interface UserCollectionInfo {
    date: string
    count: number
}

export interface UserAccess {
    type: string
    total_count: number
    new_count: number
    existing_count: number
    isLoss: boolean
    percentage: number
}
