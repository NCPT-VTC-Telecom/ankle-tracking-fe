import { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';

export const contactApi = {
    submit: (data: any): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/customer_service/send_request',
            method: 'post',
            data
        })
};
