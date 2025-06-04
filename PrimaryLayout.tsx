import React, { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Phone, Mail, Clock, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrimaryLayoutProps {
  children: ReactNode;
}

const PrimaryLayout: React.FC<PrimaryLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Info Bar */}
      <div className="bg-[#005a8e] text-white py-2 text-sm hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex space-x-4">
            <a href="tel:1-800-123-4567" className="flex items-center hover:text-white/80">
              <Phone className="h-3 w-3 mr-1" />
              <span>1-800-123-4567</span>
            </a>
            <a href="mailto:info@completeeatingcare.com" className="flex items-center hover:text-white/80">
              <Mail className="h-3 w-3 mr-1" />
              <span>info@completeeatingcare.com</span>
            </a>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Mon-Fri: 8am-6pm</span>
            </div>
          </div>
          <div>
            <Link href="/login" className="hover:text-white/80">Login</Link>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="font-bold text-2xl text-[#005a8e]">
              Complete <span className="text-[#5a9e97]">Eating Care</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`font-medium ${location === '/' ? 'text-[#5a9e97]' : 'text-gray-600 hover:text-[#5a9e97]'}`}>
              Home
            </Link>
            <Link href="/treatments" className={`font-medium ${location.startsWith('/treatments') ? 'text-[#5a9e97]' : 'text-gray-600 hover:text-[#5a9e97]'}`}>
              Treatment Programs
            </Link>
            <Link href="/locations" className={`font-medium ${location.startsWith('/locations') ? 'text-[#5a9e97]' : 'text-gray-600 hover:text-[#5a9e97]'}`}>
              Locations
            </Link>
            <Link href="/team" className={`font-medium ${location === '/team' ? 'text-[#5a9e97]' : 'text-gray-600 hover:text-[#5a9e97]'}`}>
              Our Team
            </Link>
            <Link href="/about" className={`font-medium ${location === '/about' ? 'text-[#5a9e97]' : 'text-gray-600 hover:text-[#5a9e97]'}`}>
              About Us
            </Link>
            <Button className="bg-[#5a9e97] hover:bg-[#4a8e87]">
              Contact Us
            </Button>
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-600 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t py-4 shadow-md">
            <div className="container mx-auto px-4 space-y-3">
              <Link href="/" onClick={closeMobileMenu} className={`block py-2 font-medium ${location === '/' ? 'text-[#5a9e97]' : 'text-gray-600'}`}>
                Home
              </Link>
              <Link href="/treatments" onClick={closeMobileMenu} className={`block py-2 font-medium ${location.startsWith('/treatments') ? 'text-[#5a9e97]' : 'text-gray-600'}`}>
                Treatment Programs
              </Link>
              <Link href="/locations" onClick={closeMobileMenu} className={`block py-2 font-medium ${location.startsWith('/locations') ? 'text-[#5a9e97]' : 'text-gray-600'}`}>
                Locations
              </Link>
              <Link href="/team" onClick={closeMobileMenu} className={`block py-2 font-medium ${location === '/team' ? 'text-[#5a9e97]' : 'text-gray-600'}`}>
                Our Team
              </Link>
              <Link href="/about" onClick={closeMobileMenu} className={`block py-2 font-medium ${location === '/about' ? 'text-[#5a9e97]' : 'text-gray-600'}`}>
                About Us
              </Link>
              <div className="pt-2">
                <Button className="w-full bg-[#5a9e97] hover:bg-[#4a8e87]">
                  Contact Us
                </Button>
              </div>
              <div className="pt-2">
                <Link href="/login" onClick={closeMobileMenu} className="block py-2 font-medium text-gray-600">
                  Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-[#00324e] text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1: About */}
            <div>
              <h3 className="text-xl font-bold mb-4">Complete Eating Care</h3>
              <p className="text-white/80 mb-4">
                Providing comprehensive, compassionate care for individuals struggling with eating disorders.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-[#5a9e97]">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-[#5a9e97]">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-[#5a9e97]">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-white/80 hover:text-[#5a9e97]">Home</Link>
                </li>
                <li>
                  <Link href="/treatments" className="text-white/80 hover:text-[#5a9e97]">Treatment Programs</Link>
                </li>
                <li>
                  <Link href="/locations" className="text-white/80 hover:text-[#5a9e97]">Locations</Link>
                </li>
                <li>
                  <Link href="/team" className="text-white/80 hover:text-[#5a9e97]">Our Team</Link>
                </li>
                <li>
                  <Link href="/about" className="text-white/80 hover:text-[#5a9e97]">About Us</Link>
                </li>
              </ul>
            </div>
            
            {/* Column 3: Contact */}
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Phone className="h-5 w-5 mr-2 mt-0.5 text-[#5a9e97]" />
                  <span className="text-white/80">1-800-123-4567</span>
                </li>
                <li className="flex items-start">
                  <Mail className="h-5 w-5 mr-2 mt-0.5 text-[#5a9e97]" />
                  <span className="text-white/80">info@completeeatingcare.com</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 mt-0.5 text-[#5a9e97]" />
                  <span className="text-white/80">Monday-Friday: 8am-6pm</span>
                </li>
              </ul>
            </div>
            
            {/* Column 4: Newsletter */}
            <div>
              <h3 className="text-xl font-bold mb-4">Stay Updated</h3>
              <p className="text-white/80 mb-4">
                Subscribe to our newsletter for the latest news and resources.
              </p>
              <form className="space-y-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-2 w-full bg-[#00233a] border border-[#003a5e] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#5a9e97]"
                />
                <Button className="w-full bg-[#5a9e97] hover:bg-[#4a8e87]">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
          
          <div className="border-t border-[#003a5e] mt-12 pt-6 text-center text-white/60 text-sm">
            <p>&copy; {new Date().getFullYear()} Complete Eating Care. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <Link href="/privacy" className="hover:text-[#5a9e97]">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-[#5a9e97]">Terms of Service</Link>
              <Link href="/sitemap" className="hover:text-[#5a9e97]">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrimaryLayout;