import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import { GlobalContext } from "@/lib/context";
import { Link, useLocation } from "wouter";
import { Phone, Menu, X, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { Logo } from "@/components/ui/Logo";
import { Treatment, Location } from "@shared/schema";

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get treatments and locations for dropdowns
  const { data: treatments = [] } = useQuery<Treatment[]>({
    queryKey: ['/api/center/treatments'],
  });
  
  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ['/api/center/locations'],
  });

  // Close sidebar by default on mobile, open on desktop
  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <GlobalContext.Provider value={{ 
      isOpen, 
      setIsOpen, 
      currentCategory, 
      setCurrentCategory 
    }}>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
          {/* Top header with phone and login links */}
          <div className="bg-[#5a9e97] text-white">
            <div className="container mx-auto flex justify-end items-center h-10 px-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Phone size={14} className="text-white" />
                  <span className="text-sm">Call us: (800) 555-1234</span>
                </div>

                <Link href="/login" className="text-sm hover:underline">
                  Login
                </Link>
              </div>
            </div>
          </div>
          
          {/* Main navigation */}
          <div className="bg-white shadow-sm">
            <div className="container mx-auto flex justify-between items-center h-16 px-4">
              <div className="flex items-center gap-2">
                {/* Logo */}
                <Link href="/" className="flex items-center">
                  <Logo height="48px" width="48px" />
                </Link>
              </div>
              
              <div className="flex items-center">
                <nav className="hidden lg:flex items-center gap-1">
                  <Link href="/" className={`nav-link ${location === "/" ? "active" : ""}`}>
                    Home
                  </Link>
                  <div className="relative group">
                    <Link 
                      href="/treatments" 
                      className={`nav-link flex items-center gap-1 ${location.startsWith("/treatments") ? "active" : ""}`}
                    >
                      Treatment Programs <ChevronDown size={14} />
                    </Link>
                    <div className="absolute left-0 top-full w-64 bg-white shadow-lg rounded-md p-4 hidden group-hover:block z-50">
                      <Link href="/treatments" className="block py-2 px-3 hover:bg-[#f5f7fa] rounded text-[#5a9e97] font-medium" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.5px' }}>
                        All Programs
                      </Link>
                      <div className="my-1 border-t border-gray-100"></div>
                      {treatments.map((treatment) => (
                        <Link 
                          key={treatment.id} 
                          href={`/treatments/${treatment.id}`} 
                          className="block py-2 px-3 hover:bg-[#f5f7fa] rounded text-[#294c45]"
                          style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', letterSpacing: '0.5px' }}
                        >
                          {treatment.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="relative group">
                    <Link 
                      href="/locations" 
                      className={`nav-link flex items-center gap-1 ${location.startsWith("/locations") ? "active" : ""}`}
                    >
                      Locations <ChevronDown size={14} />
                    </Link>
                    <div className="absolute left-0 top-full w-64 bg-white shadow-lg rounded-md p-4 hidden group-hover:block z-50">
                      <Link href="/locations" className="block py-2 px-3 hover:bg-[#f5f7fa] rounded text-[#5a9e97] font-medium" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.5px' }}>
                        All Locations
                      </Link>
                      <div className="my-1 border-t border-gray-100"></div>
                      {locations.map((loc) => (
                        <Link 
                          key={loc.id} 
                          href={`/locations/${loc.id}`} 
                          className="block py-2 px-3 hover:bg-[#f5f7fa] rounded text-[#294c45]"
                          style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', letterSpacing: '0.5px' }}
                        >
                          {loc.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <Link href="/team" className={`nav-link ${location === "/team" ? "active" : ""}`}>
                    Leadership
                  </Link>
                  <a href="#" className="nav-link">Resources</a>
                  <a href="#" className="nav-link">Contact</a>
                </nav>

                {/* Admin sidebar toggle for small screens */}
                <div className="lg:hidden flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#005a8e]"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <Menu size={24} />
                  </Button>
                  
                  {/* Mobile menu button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#005a8e]"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white border-t border-gray-200 py-4">
              <div className="container mx-auto px-4">
                <nav className="flex flex-col space-y-4">
                  <Link href="/" className="text-[#294c45] py-2 font-medium" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.5px' }}>
                    Home
                  </Link>
                  <Link href="/treatments" className="text-[#294c45] py-2 font-medium" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.5px' }}>
                    Treatment Programs
                  </Link>
                  {/* Mobile treatment menu items */}
                  {treatments.map((treatment) => (
                    <Link 
                      key={treatment.id} 
                      href={`/treatments/${treatment.id}`} 
                      className="text-[#5a9e97] py-2 pl-4 text-sm"
                      style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.5px' }}
                    >
                      {treatment.name}
                    </Link>
                  ))}
                  <Link href="/locations" className="text-[#294c45] py-2 font-medium" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.5px' }}>
                    Locations
                  </Link>
                  {/* Mobile locations menu items */}
                  {locations.map((loc) => (
                    <Link 
                      key={loc.id} 
                      href={`/locations/${loc.id}`} 
                      className="text-[#5a9e97] py-2 pl-4 text-sm"
                      style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.5px' }}
                    >
                      {loc.name}
                    </Link>
                  ))}
                  <Link href="/team" className="text-[#294c45] py-2 font-medium" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.5px' }}>
                    Leadership
                  </Link>
                  <a href="#" className="text-[#294c45] py-2 font-medium" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.5px' }}>Resources</a>
                  <a href="#" className="text-[#294c45] py-2 font-medium" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.5px' }}>Contact</a>
                  <Link href="/login" className="text-[#294c45] py-2 font-medium" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.5px' }}>
                    Login
                  </Link>
                  <Link href="/auth-test" className="text-[#294c45] py-2 font-medium" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.5px' }}>
                    Auth Test
                  </Link>
                </nav>
              </div>
            </div>
          )}
        </header>

        <div className="flex-1 flex">
          {isOpen && <Sidebar 
            isOpen={isOpen} 
            setIsOpen={setIsOpen} 
            currentCategory={currentCategory} 
            setCurrentCategory={setCurrentCategory} 
          />}
          <main className="flex-1">
            {children}
          </main>
        </div>
        
        {/* Footer */}
        <footer className="bg-[#333] text-white">
          <div className="container mx-auto py-10 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Complete Eating Care</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Comprehensive treatment for eating disorders, providing compassionate care and personalized recovery plans.
                </p>
                <div className="flex items-center gap-1 text-sm">
                  <Phone size={14} /> 
                  <span>(800) 555-1234</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/" className="hover:underline">Home</Link></li>
                  <li><Link href="/treatments" className="hover:underline">Treatment Programs</Link></li>
                  <li><Link href="/locations" className="hover:underline">Locations</Link></li>
                  <li><Link href="/team" className="hover:underline">Leadership</Link></li>
                  <li><a href="#" className="hover:underline">Resources</a></li>
                  <li><a href="#" className="hover:underline">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Our Locations</h3>
                <ul className="space-y-2 text-sm">
                  {locations ? (
                    locations.map((location: any) => (
                      <li key={location.id}>
                        <Link href={`/locations/${location.id}`} className="hover:underline">
                          {location.city}, {location.state}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li>Loading locations...</li>
                  )}
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-gray-400">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  © {new Date().getFullYear()} Complete Eating Care. All rights reserved.
                </div>
                <div className="flex gap-4">
                  <a href="#" className="hover:text-white">Privacy Policy</a>
                  <a href="#" className="hover:text-white">Terms of Service</a>
                  <a href="#" className="hover:text-white">Accessibility</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <Toaster />
    </GlobalContext.Provider>
  );
}