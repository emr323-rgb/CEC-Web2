import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, LogOut, User } from "lucide-react";
import { useLocation } from "wouter";

export default function AuthTestPage() {
  const { user, loginMutation, logoutMutation, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [credentials, setCredentials] = useState({
    username: "admin2",
    password: "password"
  });

  // Log authentication state for debugging
  useEffect(() => {
    console.log("Auth state:", { 
      user, 
      isLoading, 
      loginPending: loginMutation.isPending, 
      loginError: loginMutation.error
    });
  }, [user, isLoading, loginMutation.isPending, loginMutation.error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt with:", credentials);
    loginMutation.mutate(credentials);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const goToAdmin = () => {
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Authentication Test Page</CardTitle>
          <CardDescription>Test login and logout functionality</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : user ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2 text-green-700 font-medium">
                <User size={20} />
                <span>Logged in as {user.username}</span>
              </div>
              <p className="text-sm text-green-600">User ID: {user.id}</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">Username</label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={credentials.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>
              
              {loginMutation.isError && (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">
                  {loginMutation.error?.message || "Login failed. Please check your credentials."}
                </div>
              )}
            </form>
          )}

          <div className="pt-4 text-sm text-gray-500">
            <p>API Status: {loginMutation.isPending ? "Loading..." : "Ready"}</p>
            <p>User State: {user ? "Authenticated" : "Not authenticated"}</p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2">
          {user ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </>
                )}
              </Button>
              <Button onClick={goToAdmin}>
                Go to Admin Dashboard
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}