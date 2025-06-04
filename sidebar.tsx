import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { ChevronDown, ChevronRight, Home, MapPin, Users, Stethoscope, Settings, BarChart, PlusCircle, LayoutDashboard, FileText, Upload, DollarSign } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "@/components/ui/Logo";

type SidebarProps = React.HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
};

export function Sidebar({
  className,
  isOpen,
  setIsOpen,
  currentCategory,
  setCurrentCategory,
  ...props
}: SidebarProps) {
  const [location] = useLocation();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [legacyMenuOpen, setLegacyMenuOpen] = useState(false);

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "bg-white shadow-md fixed inset-y-0 left-0 z-20 w-64 transform transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
      {...props}
    >
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center justify-center">
          <Logo height="80px" showText={false} />
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <ScrollArea className="h-[calc(100vh-5rem)]">
        <nav className="p-4">
          <ul className="space-y-2">
            {/* Complete Eating Care Navigation */}
            <li>
              <Link
                href="/"
                onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                className={cn(
                  "flex items-center p-2 rounded-md",
                  isActive("/") && !location.includes("legacy")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Home className="h-5 w-5 mr-3" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link
                href="/locations"
                onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                className={cn(
                  "flex items-center p-2 rounded-md",
                  isActive("/locations")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <MapPin className="h-5 w-5 mr-3" />
                <span>Locations</span>
              </Link>
            </li>
            <li>
              <Link
                href="/staff"
                onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                className={cn(
                  "flex items-center p-2 rounded-md",
                  isActive("/staff")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Users className="h-5 w-5 mr-3" />
                <span>Our Team</span>
              </Link>
            </li>
            <li>
              <Link
                href="/treatments"
                onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                className={cn(
                  "flex items-center p-2 rounded-md",
                  isActive("/treatments")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Stethoscope className="h-5 w-5 mr-3" />
                <span>Treatment Programs</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin"
                onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                className={cn(
                  "flex items-center p-2 rounded-md",
                  isActive("/admin")
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Settings className="h-5 w-5 mr-3" />
                <span>Settings</span>
              </Link>
            </li>
          </ul>

          <Separator className="my-4" />

          {/* Legacy System Navigation */}
          <div 
            className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 cursor-pointer"
            onClick={() => setLegacyMenuOpen(!legacyMenuOpen)}
          >
            <span>Legacy System</span>
            {legacyMenuOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
          
          {legacyMenuOpen && (
            <ul className="space-y-2 mb-4">
              <li>
                <Link
                  href="/legacy-dashboard"
                  onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                  className={cn(
                    "flex items-center p-2 rounded-md",
                    isActive("/legacy-dashboard")
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <LayoutDashboard className="h-5 w-5 mr-3" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/add-sale"
                  onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                  className={cn(
                    "flex items-center p-2 rounded-md",
                    isActive("/add-sale")
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <PlusCircle className="h-5 w-5 mr-3" />
                  <span>Add Sale Item</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/stores"
                  onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                  className={cn(
                    "flex items-center p-2 rounded-md",
                    isActive("/stores")
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>Stores</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/reports"
                  onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                  className={cn(
                    "flex items-center p-2 rounded-md",
                    isActive("/reports")
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <BarChart className="h-5 w-5 mr-3" />
                  <span>Reports</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/import"
                  onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                  className={cn(
                    "flex items-center p-2 rounded-md",
                    isActive("/import")
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Upload className="h-5 w-5 mr-3" />
                  <span>Import Spreadsheet</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/prices"
                  onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                  className={cn(
                    "flex items-center p-2 rounded-md",
                    isActive("/prices")
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <DollarSign className="h-5 w-5 mr-3" />
                  <span>Price Database</span>
                </Link>
              </li>
            </ul>
          )}

          {legacyMenuOpen && (
            <div className="mt-2">
              <div 
                className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 cursor-pointer"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
              >
                <span>Categories</span>
                {categoriesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
              
              {categoriesOpen && (
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setCurrentCategory('all')}
                      className={cn(
                        "flex items-center p-2 rounded-md w-full text-left",
                        currentCategory === 'all'
                          ? "bg-gray-100 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <span>All Categories</span>
                    </button>
                  </li>
                  {categories.map((category: any) => (
                    <li key={category.id}>
                      <button
                        onClick={() => setCurrentCategory(category.name.toLowerCase())}
                        className={cn(
                          "flex items-center p-2 rounded-md w-full text-left",
                          currentCategory === category.name.toLowerCase()
                            ? "bg-gray-100 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <span>{category.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </nav>
      </ScrollArea>
    </div>
  );
}
