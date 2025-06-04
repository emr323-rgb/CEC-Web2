import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

export default function AuthSimple() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  
  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername.length < 2) {
      toast({
        title: "Validation Error",
        description: "Username must be at least 2 characters",
        variant: "destructive",
      });
      return;
    }
    
    if (loginPassword.length < 4) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 4 characters",
        variant: "destructive",
      });
      return;
    }
    
    loginMutation.mutate({ 
      username: loginUsername, 
      password: loginPassword 
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    
    // Basic validation
    if (registerUsername.length < 2) {
      setRegisterError("Username must be at least 2 characters");
      return;
    }
    
    if (registerName.length < 2) {
      setRegisterError("Name must be at least 2 characters");
      return;
    }
    
    if (registerPassword.length < 4) {
      setRegisterError("Password must be at least 4 characters");
      return;
    }
    
    if (registerPassword !== confirmPassword) {
      setRegisterError("Passwords don't match");
      return;
    }
    
    try {
      registerMutation.mutate({
        username: registerUsername,
        password: registerPassword,
        name: registerName
      });
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  // When user is logged in
  if (user) {
    return (
      <div className="p-8 max-w-lg mx-auto my-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">You are logged in!</h1>
        <p className="mb-4">Welcome, {user.name || user.username}</p>
        <Button onClick={() => {
          toast({
            title: "Authentication Success",
            description: "You are now logged in and can access protected routes.",
          });
        }}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Complete Eating Care</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input 
                    id="login-username"
                    type="text" 
                    placeholder="Your username" 
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password"
                    type="password" 
                    placeholder="••••••••" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                {registerError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {registerError}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="register-username">Username</Label>
                  <Input 
                    id="register-username"
                    type="text" 
                    placeholder="Choose a username" 
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input 
                    id="register-name"
                    type="text" 
                    placeholder="John Doe" 
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input 
                    id="register-password"
                    type="password" 
                    placeholder="••••••••" 
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input 
                    id="confirm-password"
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Registering..." : "Register"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}