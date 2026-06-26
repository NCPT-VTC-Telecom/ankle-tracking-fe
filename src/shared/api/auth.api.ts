import { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';
import { API_PATH_AUTHENTICATE } from 'shared/utils/constant';

export const authApi = {
    // === LIST ADS ===
    verify: (): AxiosPromise =>
        axiosServices({
            url: API_PATH_AUTHENTICATE.verifyLogin,
        }),


};
