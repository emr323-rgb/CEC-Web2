import React, { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  MapPin,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  Settings,
  Home,
  FileVideo,
  Shield,
  Activity,
  Video,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import logoImg from '@assets/CEC logo.png';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: 'Locations',
      href: '/admin/locations',
      icon: <MapPin size={20} />,
    },
    {
      name: 'Staff',
      href: '/admin/staff',
      icon: <Users size={20} />,
    },
    {
      name: 'Treatments',
      href: '/admin/treatments',
      icon: <Activity size={20} />,
    },
    {
      name: 'Insurance',
      href: '/admin/insurance',
      icon: <Shield size={20} />,
    },
    {
      name: 'Content',
      href: '/admin/content',
      icon: <FileText size={20} />,
    },
    {
      name: 'Hero Video',
      href: '/admin/homepage-hero-video',
      icon: <Video size={20} />,
    },
    {
      name: 'Video',
      href: '/admin/video',
      icon: <FileVideo size={20} />,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: <Settings size={20} />,
    },
  ];

  // If user is not authenticated, show unauthorized message
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to access this area.</p>
          <Link href="/auth">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation for mobile */}
      <header className="bg-white shadow-sm py-4 px-4 flex md:hidden items-center justify-between sticky top-0 z-10">
        <Link href="/admin">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Logo" className="h-8 w-auto" />
            <span className="font-bold text-lg">Admin</span>
          </div>
        </Link>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <Link href="/admin">
                  <div className="flex items-center gap-2">
                    <img src={logoImg} alt="Logo" className="h-8 w-auto" />
                    <span className="font-bold text-lg">Admin Panel</span>
                  </div>
                </Link>
              </div>
              
              <nav className="flex-1 p-4">
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        location === item.href
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100'
                      }`}>
                        <span className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.name}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                  
                  <li className="pt-4 mt-4 border-t">
                    <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100">
                      <span className="flex items-center gap-3">
                        <Home size={20} />
                        <span>View Website</span>
                      </span>
                    </Link>
                  </li>
                  
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100"
                    >
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </nav>
              
              <div className="p-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-500">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 bg-white shadow-md">
          <div className="p-5 border-b">
            <Link href="/admin">
              <div className="flex items-center gap-2">
                <img src={logoImg} alt="Logo" className="h-8 w-auto" />
                <span className="font-bold text-lg">Admin Panel</span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    location === item.href
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                  }`}>
                    <span className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.name}</span>
                    </span>
                  </Link>
                </li>
              ))}
              
              <li className="pt-4 mt-4 border-t">
                <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100">
                  <span className="flex items-center gap-3">
                    <Home size={20} />
                    <span>View Website</span>
                  </span>
                </Link>
              </li>
              
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
          
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="md:ml-64 flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}