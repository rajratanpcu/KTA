import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockApi } from '../services/stock-api';
import type { StockMovementRequest, StockTransferRequest } from '../services/stock-api';

export function useStockBalances() {
  return useQuery({
    queryKey: ['stock-balances'],
    queryFn: stockApi.getAllBalances,
  });
}

export function useStockBalancesByGodown(godownId: number) {
  return useQuery({
    queryKey: ['stock-balances', 'godown', godownId],
    queryFn: () => stockApi.getBalancesByGodown(godownId),
    enabled: !!godownId,
  });
}

export function useLowStockAlerts() {
  return useQuery({
    queryKey: ['stock-balances', 'low-stock'],
    queryFn: stockApi.getLowStockAlerts,
  });
}

export function useStockMovements() {
  return useQuery({
    queryKey: ['stock-movements'],
    queryFn: stockApi.getRecentMovements,
  });
}

export function useRecordStockMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StockMovementRequest) => stockApi.recordMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-balances'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
    },
  });
}

export function useStockTransfers() {
  return useQuery({
    queryKey: ['stock-transfers'],
    queryFn: stockApi.getAllTransfers,
  });
}

export function useCreateStockTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StockTransferRequest) => stockApi.createTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['stock-balances'] });
    },
  });
}

export function useReceiveStockTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => stockApi.receiveTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['stock-balances'] });
    },
  });
}
