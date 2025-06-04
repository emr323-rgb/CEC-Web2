import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconClass: string;
  trend?: string;
  isLoading?: boolean;
};

export default function StatCard({
  title,
  value,
  icon,
  iconClass,
  trend,
  isLoading = false,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${iconClass}`}>{icon}</div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <div className="flex items-baseline">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <span className="text-2xl font-semibold">{value}</span>
                  {trend && (
                    <span className="ml-2 text-sm text-green-500">
                      {trend}{" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 inline"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="19" x2="12" y2="5"></line>
                        <polyline points="5 12 12 5 19 12"></polyline>
                      </svg>
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
