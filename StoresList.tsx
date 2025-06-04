import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Store = {
  id: number;
  name: string;
  currentSales: number;
};

type StoresListProps = {
  stores: Store[];
  isLoading: boolean;
};

export default function StoresList({ stores, isLoading }: StoresListProps) {
  // Sort stores by number of current sales
  const sortedStores = [...stores].sort((a, b) => b.currentSales - a.currentSales);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Top Stores</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ul className="space-y-3">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-primary rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                    </div>
                    <Skeleton className="h-4 w-20 ml-3" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </li>
              ))}
          </ul>
        ) : (
          <ul className="space-y-3">
            {sortedStores.slice(0, 5).map((store) => (
              <li key={store.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-primary rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <span className="ml-3 text-sm font-medium">{store.name}</span>
                </div>
                <span className="text-sm text-gray-500">{store.currentSales} sales</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
