import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi, categoryApi, godownApi } from '../services/core-api';
import type { ProductRequest, CategoryRequest, GodownRequest } from '../services/core-api';

// ===== Product Hooks =====

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: productApi.getAll,
  });
}

export function useActiveProducts() {
  return useQuery({
    queryKey: ['products', 'active'],
    queryFn: productApi.getActive,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productApi.getById(id),
    enabled: !!id,
  });
}

export function useProductSearch(query: string) {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => productApi.search(query),
    enabled: query.length > 0,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductRequest) => productApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductRequest }) =>
      productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ===== Category Hooks =====

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
  });
}

export function useActiveCategories() {
  return useQuery({
    queryKey: ['categories', 'active'],
    queryFn: categoryApi.getActive,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryRequest) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryRequest }) =>
      categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ===== Godown Hooks =====

export function useGodowns() {
  return useQuery({
    queryKey: ['godowns'],
    queryFn: godownApi.getAll,
  });
}

export function useActiveGodowns() {
  return useQuery({
    queryKey: ['godowns', 'active'],
    queryFn: godownApi.getActive,
  });
}

export function useGodown(id: number) {
  return useQuery({
    queryKey: ['godowns', id],
    queryFn: () => godownApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateGodown() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GodownRequest) => godownApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['godowns'] });
    },
  });
}

export function useUpdateGodown() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: GodownRequest }) =>
      godownApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['godowns'] });
    },
  });
}

export function useDeleteGodown() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => godownApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['godowns'] });
    },
  });
}
