import { useQuery } from '@tanstack/react-query';
import apiClient from './useApi';

export const useDashboardStats = () =>
  useQuery({ queryKey: ['dashboard'], queryFn: () => apiClient.getDashboardStats().then(r => r.data) });

export const useClients = (params?: object) =>
  useQuery({ queryKey: ['clients', params], queryFn: () => apiClient.getClients(params).then(r => r.data) });

export const useClient = (id: number) =>
  useQuery({ queryKey: ['client', id], queryFn: () => apiClient.getClient(id).then(r => r.data), enabled: !!id });

export const usePrescriptions = (params?: object & { clientId?: number }) =>
  useQuery({
    queryKey: ['prescriptions', params],
    queryFn: () => apiClient.getPrescriptions(params).then(r => r.data),
    enabled: !!(params as any)?.clientId,
  });

export const useProducts = (params?: object) =>
  useQuery({ queryKey: ['products', params], queryFn: () => apiClient.getProducts(params).then(r => r.data) });

export const useOrders = (params?: object) =>
  useQuery({ queryKey: ['orders', params], queryFn: () => apiClient.getOrders(params).then(r => r.data) });

export const useOrder = (id: number) =>
  useQuery({ queryKey: ['order', id], queryFn: () => apiClient.getOrder(id).then(r => r.data), enabled: !!id });

export const useInsuranceFiles = (params?: object) =>
  useQuery({ queryKey: ['insurance', params], queryFn: () => apiClient.getInsuranceFiles(params).then(r => r.data) });
