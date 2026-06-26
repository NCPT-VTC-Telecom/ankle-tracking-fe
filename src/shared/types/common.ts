export interface ChartDonut {
    labels: string[];
    series: number[];
}

export interface ChartLine {
    categories: string[];
    series: { name: string; data: number[] }[];
}
