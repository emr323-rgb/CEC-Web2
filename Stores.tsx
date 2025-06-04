import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import StoreCard from "@/components/StoreCard";
import AddStoreModal from "@/components/AddStoreModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Stores() {
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['/api/stores'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/stores/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Store deleted",
        description: "The store has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the store. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteStore = (id: number) => {
    if (window.confirm("Are you sure you want to delete this store?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Stores Database</h2>
          <p className="text-gray-500 text-sm">Manage and view stores in the Lakewood area</p>
        </div>
        <Button onClick={() => setIsAddStoreOpen(true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Store
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <div className="mt-4 pt-4 border-t">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stores.map((store: any) => (
            <StoreCard 
              key={store.id} 
              store={store} 
              onEdit={() => {}} 
              onDelete={() => handleDeleteStore(store.id)} 
            />
          ))}
        </div>
      )}

      <AddStoreModal 
        isOpen={isAddStoreOpen} 
        onClose={() => setIsAddStoreOpen(false)} 
      />
    </div>
  );
}
