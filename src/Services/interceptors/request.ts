import type { InternalAxiosRequestConfig } from 'axios';
import { TokenService } from '../storage/token';

export function handleRequestInterceptor(
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig {
  const token = TokenService.getToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}