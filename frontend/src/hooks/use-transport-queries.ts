import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  transporterApi,
  transportBillApi,
  transportPaymentApi,
  transportDocumentApi,
} from '../services/transport-api';
import type {
  TransporterRequest,
  TransportBillRequest,
  TransportPaymentRequest,
} from '../services/transport-api';

// ===== Transporter Hooks =====

export function useTransporters() {
  return useQuery({
    queryKey: ['transporters'],
    queryFn: transporterApi.getAll,
  });
}

export function useActiveTransporters() {
  return useQuery({
    queryKey: ['transporters', 'active'],
    queryFn: transporterApi.getActive,
  });
}

export function useTransporter(id: number) {
  return useQuery({
    queryKey: ['transporters', id],
    queryFn: () => transporterApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTransporter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransporterRequest) => transporterApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transporters'] });
    },
  });
}

export function useUpdateTransporter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TransporterRequest }) =>
      transporterApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transporters'] });
    },
  });
}

export function useDeleteTransporter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => transporterApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transporters'] });
    },
  });
}

// ===== Transport Bill Hooks =====

export function useTransportBills() {
  return useQuery({
    queryKey: ['transport-bills'],
    queryFn: transportBillApi.getAll,
  });
}

export function useTransportBill(id: number) {
  return useQuery({
    queryKey: ['transport-bills', id],
    queryFn: () => transportBillApi.getById(id),
    enabled: !!id,
  });
}

export function useTransportBillsByTransporter(transporterId: number) {
  return useQuery({
    queryKey: ['transport-bills', 'transporter', transporterId],
    queryFn: () => transportBillApi.getByTransporter(transporterId),
    enabled: !!transporterId,
  });
}

export function useTransportBillsByStatus(status: string) {
  return useQuery({
    queryKey: ['transport-bills', 'status', status],
    queryFn: () => transportBillApi.getByStatus(status),
    enabled: !!status,
  });
}

export function useTransportBillsNeedingReview() {
  return useQuery({
    queryKey: ['transport-bills', 'needs-review'],
    queryFn: transportBillApi.getNeedsReview,
  });
}

export function useOverdueTransportBills() {
  return useQuery({
    queryKey: ['transport-bills', 'overdue'],
    queryFn: transportBillApi.getOverdue,
  });
}

export function useOutstandingBalance(transporterId: number) {
  return useQuery({
    queryKey: ['transport-bills', 'outstanding', transporterId],
    queryFn: () => transportBillApi.getOutstandingBalance(transporterId),
    enabled: !!transporterId,
  });
}

export function useCreateTransportBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransportBillRequest) => transportBillApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transport-bills'] });
      queryClient.invalidateQueries({ queryKey: ['transporters'] });
    },
  });
}

export function useUpdateTransportBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TransportBillRequest }) =>
      transportBillApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transport-bills'] });
    },
  });
}

export function useDeleteTransportBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => transportBillApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transport-bills'] });
    },
  });
}

// ===== Transport Payment Hooks =====

export function useTransportPayments() {
  return useQuery({
    queryKey: ['transport-payments'],
    queryFn: transportPaymentApi.getAll,
  });
}

export function useTransportPayment(id: number) {
  return useQuery({
    queryKey: ['transport-payments', id],
    queryFn: () => transportPaymentApi.getById(id),
    enabled: !!id,
  });
}

export function useTransportPaymentsByTransporter(transporterId: number) {
  return useQuery({
    queryKey: ['transport-payments', 'transporter', transporterId],
    queryFn: () => transportPaymentApi.getByTransporter(transporterId),
    enabled: !!transporterId,
  });
}

export function useCreateTransportPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransportPaymentRequest) => transportPaymentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transport-payments'] });
      queryClient.invalidateQueries({ queryKey: ['transport-bills'] });
      queryClient.invalidateQueries({ queryKey: ['transporters'] });
    },
  });
}

export function useDeleteTransportPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => transportPaymentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transport-payments'] });
      queryClient.invalidateQueries({ queryKey: ['transport-bills'] });
    },
  });
}

export function useUploadTransportDocument() {
  return useMutation({
    mutationFn: (file: File) => transportDocumentApi.upload(file),
  });
}
