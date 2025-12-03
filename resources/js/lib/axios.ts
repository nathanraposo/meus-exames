import axios from 'axios';

// Cria instância configurada do Axios para o projeto
const axiosInstance = axios.create({
    baseURL: '/',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
    withXSRFToken: true,
});

export default axiosInstance;
