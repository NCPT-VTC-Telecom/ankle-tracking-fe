import lodash from 'lodash';


export const normalizeValue = (value: any) => {
    if (value === null || value === undefined || value === '') return '';
    return value;
};
export const normalizeKeys = (obj: Record<string, any>): Record<string, any> => {
    const newObj: Record<string, any> = {};
    Object.keys(obj).forEach((key) => {
        const camelKey = lodash.camelCase(key);
        newObj[camelKey] =
            obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])
                ? normalizeKeys(obj[key]) // đệ quy nếu value cũng là object
                : obj[key];
    });
    return newObj;
};