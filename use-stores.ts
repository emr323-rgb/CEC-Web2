import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useStores() {
  const queryClient = useQueryClient();

  const { data: stores = [], isLoading, error } = useQuery({
    queryKey: ['/api/stores'],
  });

  const addStore = useMutation({
    mutationFn: (storeData: any) => {
      return apiRequest("POST", "/api/stores", storeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
    }
  });

  const updateStore = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/stores/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
    }
  });

  const deleteStore = useMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/stores/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
    }
  });

  return {
    stores,
    isLoading,
    error,
    addStore,
    updateStore,
    deleteStore,
  };
}

export function useStore(id: number) {
  const { data: store, isLoading, error } = useQuery({
    queryKey: ['/api/stores', id],
    enabled: !!id,
  });

  return {
    store,
    isLoading,
    error,
  };
}
