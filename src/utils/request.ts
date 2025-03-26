import axios, { AxiosRequestConfig } from 'axios';
import { handleApiError } from './errorHandler';
import { measureAsyncExecution } from './performance';

// 创建axios实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证信息，例如JWT token
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 可以在这里统一处理响应
    return response;
  },
  (error) => {
    // 使用错误处理工具处理API错误
    handleApiError(error);
    return Promise.reject(error);
  }
);

// 通用GET请求
export async function get<T = any>(
  url: string, 
  params?: any, 
  config?: AxiosRequestConfig
): Promise<T> {
  return measureAsyncExecution(`GET ${url}`, async () => {
    const response = await instance.get<T>(url, { 
      params, 
      ...config 
    });
    return response.data;
  });
}

// 通用POST请求
export async function post<T = any>(
  url: string, 
  data?: any, 
  config?: AxiosRequestConfig
): Promise<T> {
  return measureAsyncExecution(`POST ${url}`, async () => {
    const response = await instance.post<T>(url, data, config);
    return response.data;
  });
}

// 通用PUT请求
export async function put<T = any>(
  url: string, 
  data?: any, 
  config?: AxiosRequestConfig
): Promise<T> {
  return measureAsyncExecution(`PUT ${url}`, async () => {
    const response = await instance.put<T>(url, data, config);
    return response.data;
  });
}

// 通用DELETE请求
export async function del<T = any>(
  url: string, 
  config?: AxiosRequestConfig
): Promise<T> {
  return measureAsyncExecution(`DELETE ${url}`, async () => {
    const response = await instance.delete<T>(url, config);
    return response.data;
  });
}

// 通用PATCH请求
export async function patch<T = any>(
  url: string, 
  data?: any, 
  config?: AxiosRequestConfig
): Promise<T> {
  return measureAsyncExecution(`PATCH ${url}`, async () => {
    const response = await instance.patch<T>(url, data, config);
    return response.data;
  });
}

// 表单数据POST请求
export async function postForm<T = any>(
  url: string, 
  formData: FormData, 
  config?: AxiosRequestConfig
): Promise<T> {
  return measureAsyncExecution(`POST FORM ${url}`, async () => {
    const response = await instance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    });
    return response.data;
  });
}

// 导出默认实例，以便进行自定义配置
export default instance; 