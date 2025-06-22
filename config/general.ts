export const setOnlyNumber = (value: string): string => {
    return value.replace(/[^0-9]/g, '');
};

export const setOnlyText = (value: string): string => {
    return value.replace(/[^a-zA-z ]/g, '').replace(/^0+/, '');
};