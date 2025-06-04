import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useSales(category: string = 'all') {
  const queryClient = useQueryClient();

  const { data: allSales = [], isLoading, error } = useQuery({
    queryKey: ['/api/sales'],
  });

  // Filter sales by category if specified
  const sales = category === 'all' 
    ? allSales 
    : allSales.filter((sale: any) => 
        sale.category.name.toLowerCase() === category.toLowerCase()
      );

  const addSale = useMutation({
    mutationFn: (saleData: any) => {
      return apiRequest("POST", "/api/sales", saleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/top'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
    }
  });

  return {
    sales,
    isLoading,
    error,
    addSale,
  };
}

export function useTopSales(limit: number = 10, category: string = 'all') {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['/api/sales/top', { limit }],
  });

  // Filter sales by category if specified
  const sales = category === 'all' 
    ? data 
    : data.filter((sale: any) => 
        sale.category.name.toLowerCase() === category.toLowerCase()
      );

  return {
    sales,
    isLoading,
    error,
  };
}

export function useRecentSales(limit: number = 10, category: string = 'all') {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['/api/sales/recent', { limit }],
  });

  // Filter sales by category if specified
  const sales = category === 'all' 
    ? data 
    : data.filter((sale: any) => 
        sale.category.name.toLowerCase() === category.toLowerCase()
      );

  return {
    sales,
    isLoading,
    error,
  };
}
