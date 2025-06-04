import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Sale = {
  id: number;
  itemName: string;
  store: {
    id: number;
    name: string;
    location: string;
  };
  regularPrice: string;
  salePrice: string;
  savingsPercent: number;
  category: {
    id: number;
    name: string;
  };
};

type RecentSalesProps = {
  sales: Sale[];
  isLoading: boolean;
  currentCategory: string;
};

export default function RecentSales({ sales, isLoading, currentCategory }: RecentSalesProps) {
  const filteredSales = currentCategory === 'all'
    ? sales
    : sales.filter(sale => sale.category.name.toLowerCase() === currentCategory);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recently Added Sales</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ul className="divide-y divide-gray-200">
            {Array(4)
              .fill(0)
              .map((_, index) => (
                <li key={index} className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        ) : filteredSales.length === 0 ? (
          <div className="py-3 text-center text-gray-500">
            No recent sales found for the selected category
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredSales.slice(0, 4).map((sale) => (
              <li key={sale.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sale.itemName}</p>
                    <p className="text-xs text-gray-500">
                      {sale.store.name}, {sale.store.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${parseFloat(sale.salePrice.toString()).toFixed(2)}{" "}
                      <span className="text-xs text-gray-500 line-through">
                        ${parseFloat(sale.regularPrice.toString()).toFixed(2)}
                      </span>
                    </p>
                    <p className="text-xs text-green-600">{sale.savingsPercent}% off</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
