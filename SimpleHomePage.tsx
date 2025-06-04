import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { InsuranceCarousel } from '@/components/InsuranceCarousel';

/**
 * Ultra-simple static homepage with direct Vimeo embed using iframe
 * Completely hardcoded for maximum reliability in deployment
 */
export default function SimpleHomePage() {
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
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-[#005a8e]">
            Our Treatment Programs
          </h2>
          <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
            We offer a range of evidence-based treatment programs to address eating disorders at every level of care.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Treatment Program Card 1 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                <div className="absolute inset-0 bg-[#5a9e97]/50"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 10C27.909 10 10 27.909 10 50C10 72.091 27.909 90 50 90C72.091 90 90 72.091 90 50C90 27.909 72.091 10 50 10ZM50 20C66.569 20 80 33.431 80 50C80 66.569 66.569 80 50 80C33.431 80 20 66.569 20 50C20 33.431 33.431 20 50 20Z" fill="white"/>
                    <path d="M60 30C53.333 30 50 36.667 50 40C50 36.667 46.667 30 40 30C33.333 30 30 36.667 30 45C30 53.333 50 70 50 70C50 70 70 53.333 70 45C70 36.667 66.667 30 60 30Z" fill="white"/>
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#005a8e] mb-2">Intensive Outpatient</h3>
                <p className="text-gray-600 mb-4">
                  Our intensive outpatient program provides structured therapy while allowing patients to maintain daily responsibilities.
                </p>
                <Button 
                  variant="link"
                  className="p-0 text-[#5a9e97] hover:text-[#4a8e87] font-medium flex items-center"
                >
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Treatment Program Card 2 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                <div className="absolute inset-0 bg-[#005a8e]/50"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 10C27.909 10 10 27.909 10 50C10 72.091 27.909 90 50 90C72.091 90 90 72.091 90 50C90 27.909 72.091 10 50 10ZM50 20C66.569 20 80 33.431 80 50C80 66.569 66.569 80 50 80C33.431 80 20 66.569 20 50C20 33.431 33.431 20 50 20Z" fill="white"/>
                    <path d="M60 30C53.333 30 50 36.667 50 40C50 36.667 46.667 30 40 30C33.333 30 30 36.667 30 45C30 53.333 50 70 50 70C50 70 70 53.333 70 45C70 36.667 66.667 30 60 30Z" fill="white"/>
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#005a8e] mb-2">Partial Hospitalization</h3>
                <p className="text-gray-600 mb-4">
                  Our partial hospitalization program offers full-day treatment while allowing patients to return home in the evenings.
                </p>
                <Button 
                  variant="link"
                  className="p-0 text-[#5a9e97] hover:text-[#4a8e87] font-medium flex items-center"
                >
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Treatment Program Card 3 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                <div className="absolute inset-0 bg-[#5a9e97]/50"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 10C27.909 10 10 27.909 10 50C10 72.091 27.909 90 50 90C72.091 90 90 72.091 90 50C90 27.909 72.091 10 50 10ZM50 20C66.569 20 80 33.431 80 50C80 66.569 66.569 80 50 80C33.431 80 20 66.569 20 50C20 33.431 33.431 20 50 20Z" fill="white"/>
                    <path d="M60 30C53.333 30 50 36.667 50 40C50 36.667 46.667 30 40 30C33.333 30 30 36.667 30 45C30 53.333 50 70 50 70C50 70 70 53.333 70 45C70 36.667 66.667 30 60 30Z" fill="white"/>
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#005a8e] mb-2">Residential Treatment</h3>
                <p className="text-gray-600 mb-4">
                  Our residential treatment program provides 24-hour care in a supportive and healing environment.
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
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="py-16 bg-[#005a8e] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Begin Your Recovery Journey?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Our caring team is here to help you take the first step toward healing. Contact us today for a confidential consultation.
          </p>
          <Button className="bg-white text-[#005a8e] hover:bg-white/90">
            Contact Us
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-[#00324e] text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4 text-xl">Complete Eating Care</h3>
              <p className="text-white/70 mb-4">
                Compassionate, evidence-based treatment for eating disorders across the United States.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white/70 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                  </svg>
                </a>
                <a href="#" className="text-white/70 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-white/70 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.897 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.897-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Locations</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white">New York</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Los Angeles</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Chicago</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Colorado</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Texas</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Programs</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white">Intensive Outpatient</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Partial Hospitalization</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Residential Treatment</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Family Support</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Aftercare Planning</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <address className="not-italic text-white/70">
                <p className="mb-2">Main Office:</p>
                <p className="mb-2">123 Treatment Way</p>
                <p className="mb-2">Denver, CO 80205</p>
                <p className="mb-4">United States</p>
                <p className="mb-2"><Phone className="h-4 w-4 inline mr-2" /> 1-800-123-4567</p>
                <p><Mail className="h-4 w-4 inline mr-2" /> info@completeeatingcare.com</p>
              </address>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/50 text-sm">
            <p>&copy; {new Date().getFullYear()} Complete Eating Care. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}