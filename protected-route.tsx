import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import React, { ComponentType } from "react";
import { Route, Redirect } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  return (
    <Route path={path}>
      {() => {
        const { user, isLoading } = useAuth();
        
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }
        
        if (!user) {
          console.log("User not authenticated, redirecting to login");
          return <Redirect to="/login" />;
        }
        
        return <Component />;
      }}
    </Route>
  );
}