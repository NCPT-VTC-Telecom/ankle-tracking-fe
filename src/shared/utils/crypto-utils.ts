
import CryptoJS from 'crypto-js';

const SECRET_KEY: string = import.meta.env.VITE_APP_SECRET_KEY || 'default-secret';
const PREFIX = 'enc:'

export const encryptId = (id: string) => {
    return PREFIX + CryptoJS.AES.encrypt(id, SECRET_KEY).toString();
};

export const decryptId = (value: string) => {
    if (!value.startsWith(PREFIX)) return null;
    try {
        const encrypted = value.replace(PREFIX, '');
        const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted || null;
    } catch {
        return null;
    }
};


export const isEncrypted = (value: string) => value.startsWith(PREFIX);