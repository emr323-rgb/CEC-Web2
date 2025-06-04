import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";

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
  endDate?: Date;
  category: {
    id: number;
    name: string;
  };
};

type TopSalesProps = {
  sales: Sale[];
  isLoading: boolean;
  currentCategory: string;
};

export default function TopSales({ sales, isLoading, currentCategory }: TopSalesProps) {
  const [sortBy, setSortBy] = useState("percent");

  const sortedSales = [...sales].sort((a, b) => {
    if (sortBy === "percent") {
      return b.savingsPercent - a.savingsPercent;
    } else if (sortBy === "amount") {
      return (
        parseFloat(b.regularPrice.toString()) - parseFloat(b.salePrice.toString()) -
        (parseFloat(a.regularPrice.toString()) - parseFloat(a.salePrice.toString()))
      );
    } else {
      return new Date(b.endDate || 0).getTime() - new Date(a.endDate || 0).getTime();
    }
  });

  const filteredSales = currentCategory === 'all'
    ? sortedSales
    : sortedSales.filter(sale => sale.category.name.toLowerCase() === currentCategory);

  const getDaysRemaining = (endDate?: Date) => {
    if (!endDate) return "No end date";
    const days = differenceInDays(new Date(endDate), new Date());
    if (days <= 0) return "Expired";
    if (days === 1) return "1 day";
    return `${days} days`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-base font-semibold">Best Deals Today</CardTitle>
        <Select defaultValue={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percent">Sort by % Off</SelectItem>
            <SelectItem value="amount">Sort by $ Saved</SelectItem>
            <SelectItem value="date">Sort by Date</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Regular Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sale Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Savings
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ends
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-48" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-16" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-16" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-16" />
                      </td>
                    </tr>
                  ))
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No sales found for the selected category
                  </td>
                </tr>
              ) : (
                filteredSales.slice(0, 5).map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{sale.itemName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.store.name}</div>
                      <div className="text-xs text-gray-500">{sale.store.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">${parseFloat(sale.regularPrice.toString()).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${parseFloat(sale.salePrice.toString()).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        {sale.savingsPercent}% off
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getDaysRemaining(sale.endDate ? new Date(sale.endDate) : undefined)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t">
          <a href="#" className="text-primary hover:text-primary-dark font-medium text-sm">
            View all deals →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
