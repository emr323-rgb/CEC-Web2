import React, { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/StatCard";
import TopSales from "@/components/TopSales";
import RecentSales from "@/components/RecentSales";
import StoresList from "@/components/StoresList";
import { GlobalContext } from "@/lib/context";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { currentCategory } = useContext(GlobalContext);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['/api/dashboard/summary'],
  });

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['/api/sales/top'],
  });

  const { data: recentSales, isLoading: recentLoading } = useQuery({
    queryKey: ['/api/sales/recent'],
  });

  const { data: stores, isLoading: storesLoading } = useQuery({
    queryKey: ['/api/stores'],
  });

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Total Sales"
          value={summary?.totalSales || 0}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
          }
          iconClass="bg-blue-100 text-primary"
          trend="+12%"
          isLoading={summaryLoading}
        />
        <StatCard
          title="Total Savings"
          value={`$${summary?.totalSavings.toFixed(2) || '0.00'}`}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          }
          iconClass="bg-green-100 text-secondary"
          trend="+8%"
          isLoading={summaryLoading}
        />
        <StatCard
          title="Active Stores"
          value={summary?.activeStores || 0}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
          }
          iconClass="bg-amber-100 text-accent"
          trend="+3"
          isLoading={summaryLoading}
        />
      </div>

      <TopSales 
        sales={salesData || []} 
        isLoading={salesLoading} 
        currentCategory={currentCategory}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="col-span-1 md:col-span-2">
          <RecentSales 
            sales={recentSales || []} 
            isLoading={recentLoading} 
            currentCategory={currentCategory}
          />
        </div>
        
        <div>
          <StoresList stores={stores || []} isLoading={storesLoading} />
        </div>
      </div>
    </div>
  );
}
