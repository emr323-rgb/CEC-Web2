import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { InsuranceCarousel } from '@/components/InsuranceCarousel';

/**
 * Ultra-simple static homepage with direct Vimeo embed using iframe
 * Completely hardcoded for maximum reliability in deployment
 */
export default function StaticHomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Hardcoded Vimeo Video */}
      <section className="relative min-h-[90vh] flex items-center text-white">
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#37524a]">
          {/* Direct Vimeo iframe embed with hardcoded ID */}
          <div className="absolute inset-0 w-full h-full opacity-40">
            <iframe 
              src="https://player.vimeo.com/video/824804225?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1"
              className="absolute inset-0 w-full h-full"
              frameBorder="0" 
              allow="autoplay; fullscreen; picture-in-picture" 
              allowFullScreen
              title="Background video"
              id="vimeo-iframe"
            ></iframe>
          </div>
          <div className="absolute inset-0 bg-[#37524a]/60 z-10"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-20 py-20 text-center">
          <div className="mx-auto max-w-3xl mb-8">
            <div className="inline-block bg-white/20 p-4 rounded-full mb-8">
              <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10C27.909 10 10 27.909 10 50C10 72.091 27.909 90 50 90C72.091 90 90 72.091 90 50C90 27.909 72.091 10 50 10ZM50 20C66.569 20 80 33.431 80 50C80 66.569 66.569 80 50 80C33.431 80 20 66.569 20 50C20 33.431 33.431 20 50 20Z" fill="white"/>
                <path d="M60 30C53.333 30 50 36.667 50 40C50 36.667 46.667 30 40 30C33.333 30 30 36.667 30 45C30 53.333 50 70 50 70C50 70 70 53.333 70 45C70 36.667 66.667 30 60 30Z" fill="white"/>
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
              <span className="block text-white">Complete</span> 
              <span className="block text-[#8ccdc7]">Eating</span>
              <span className="block text-white">Care</span>
            </h1>
            
            <div className="h-px w-24 bg-[#5a9e97] mx-auto my-6"></div>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Compassionate Treatment for Eating Disorders
            </p>
          </div>
          
          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm max-w-2xl mx-auto">
            <p className="text-lg text-white/90 mb-4">
              <span className="text-[#8ccdc7] font-medium">Our evidence-based approach</span> creates <span className="bg-[#5a9e97] px-2 py-1 rounded text-white">personalized treatment plans</span> to address the <span className="text-[#8ccdc7] font-medium">unique needs</span> of each individual.
            </p>
          </div>
        </div>
      </section>
      
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
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-[#5a9e97]">
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10C27.909 10 10 27.909 10 50C10 72.091 27.909 90 50 90C72.091 90 90 72.091 90 50C90 27.909 72.091 10 50 10ZM50 20C66.569 20 80 33.431 80 50C80 66.569 66.569 80 50 80C33.431 80 20 66.569 20 50C20 33.431 33.431 20 50 20Z" fill="#5a9e97"/>
                <path d="M60 30C53.333 30 50 36.667 50 40C50 36.667 46.667 30 40 30C33.333 30 30 36.667 30 45C30 53.333 50 70 50 70C50 70 70 53.333 70 45C70 36.667 66.667 30 60 30Z" fill="#5a9e97"/>
              </svg>
            </div>
            <div className="font-bold text-xl md:text-2xl ml-2">
              <span className="text-[#005a8e]">Complete</span> <span className="text-[#5a9e97]">Eating Care</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="font-medium text-[#5a9e97]">
              Home
            </Link>
            <Link href="/treatments" className="font-medium text-gray-600 hover:text-[#5a9e97]">
              Treatment Programs
            </Link>
            <Link href="/locations" className="font-medium text-gray-600 hover:text-[#5a9e97]">
              Locations
            </Link>
            <Link href="/team" className="font-medium text-gray-600 hover:text-[#5a9e97]">
              Our Team
            </Link>
            <Button className="bg-[#5a9e97] hover:bg-[#4a8e87]">
              Contact Us
            </Button>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow">
        {/* Hero Section with Direct Vimeo Embed */}
        <section className="relative min-h-[90vh] flex items-center text-white">
          <div className="absolute inset-0 z-0 overflow-hidden bg-[#37524a]">
            {/* Direct Vimeo iframe embed - most reliable method */}
            <div className="absolute inset-0 w-full h-full opacity-40">
              <iframe 
                src="https://player.vimeo.com/video/824804225?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1"
                className="absolute inset-0 w-full h-full"
                frameBorder="0" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowFullScreen
                title="Background video"
                id="vimeo-iframe"
              ></iframe>
            </div>
            <div className="absolute inset-0 bg-[#37524a]/60 z-10"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-20 py-20 text-center">
            <div className="mx-auto max-w-3xl mb-8">
              <div className="inline-block bg-white/20 p-4 rounded-full mb-8">
                <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 10C27.909 10 10 27.909 10 50C10 72.091 27.909 90 50 90C72.091 90 90 72.091 90 50C90 27.909 72.091 10 50 10ZM50 20C66.569 20 80 33.431 80 50C80 66.569 66.569 80 50 80C33.431 80 20 66.569 20 50C20 33.431 33.431 20 50 20Z" fill="white"/>
                  <path d="M60 30C53.333 30 50 36.667 50 40C50 36.667 46.667 30 40 30C33.333 30 30 36.667 30 45C30 53.333 50 70 50 70C50 70 70 53.333 70 45C70 36.667 66.667 30 60 30Z" fill="white"/>
                </svg>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                <span className="block text-white">Complete</span> 
                <span className="block text-[#8ccdc7]">Eating</span>
                <span className="block text-white">Care</span>
              </h1>
              
              <div className="h-px w-24 bg-[#5a9e97] mx-auto my-6"></div>
              
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                Compassionate Treatment for Eating Disorders
              </p>
            </div>
            
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm max-w-2xl mx-auto">
              <p className="text-lg text-white/90 mb-4">
                <span className="text-[#8ccdc7] font-medium">Our evidence-based approach</span> creates <span className="bg-[#5a9e97] px-2 py-1 rounded text-white">personalized treatment plans</span> to address the <span className="text-[#8ccdc7] font-medium">unique needs</span> of each individual.
              </p>
            </div>
          </div>
        </section>
        
        {/* Insurance Providers Section */}
        <section className="py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-800">
              We Accept Most Major Insurance Plans
            </h2>
            <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
              We're in-network with many insurance providers to make treatment more accessible. 
              Contact us to verify your coverage.
            </p>
            
            <div className="mb-10">
              <InsuranceCarousel />
            </div>
            
            <div className="flex justify-center mt-6">
              <Button 
                className="bg-[#5a9e97] hover:bg-[#4a8e87]"
                asChild
              >
                <Link href="/admin">
                  Go to Admin Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Treatment Programs Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-800">
              Our Treatment Programs
            </h2>
            <div className="h-1 w-24 bg-[#5a9e97] mx-auto mb-12"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group h-full">
                <div className="aspect-video relative overflow-hidden rounded-t-lg mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop"
                    alt="Intensive Outpatient Program"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-[#5a9e97] transition-colors">
                  Intensive Outpatient Program (IOP)
                </h3>
                <p className="text-gray-600 mb-4">
                  Our Intensive Outpatient Program provides structured treatment while allowing patients to maintain their daily responsibilities.
                </p>
                <Button
                  variant="link"
                  className="p-0 text-[#5a9e97] hover:text-[#4a8e87] font-medium flex items-center"
                >
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              
              <div className="group h-full">
                <div className="aspect-video relative overflow-hidden rounded-t-lg mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?q=80&w=1974&auto=format&fit=crop"
                    alt="Partial Hospitalization Program"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-[#5a9e97] transition-colors">
                  Partial Hospitalization Program (PHP)
                </h3>
                <p className="text-gray-600 mb-4">
                  Our Partial Hospitalization Program offers a higher level of care than outpatient services, with full-day treatment programming.
                </p>
                <Button
                  variant="link"
                  className="p-0 text-[#5a9e97] hover:text-[#4a8e87] font-medium flex items-center"
                >
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              
              <div className="group h-full">
                <div className="aspect-video relative overflow-hidden rounded-t-lg mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop"
                    alt="Residential Treatment"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-[#5a9e97] transition-colors">
                  Residential Treatment
                </h3>
                <p className="text-gray-600 mb-4">
                  Our Residential Treatment program provides 24-hour care in a comfortable home-like setting for individuals who need intensive support.
                </p>
                <Button
                  variant="link"
                  className="p-0 text-[#5a9e97] hover:text-[#4a8e87] font-medium flex items-center"
                >
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-[#00324e] text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Complete Eating Care</h3>
              <p className="text-white/80 mb-4">
                Providing comprehensive, compassionate care for individuals struggling with eating disorders.
              </p>
            </div>
            
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
              </ul>
            </div>
            
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
              </ul>
            </div>
            
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
          </div>
        </div>
      </footer>
    </div>
  );
}