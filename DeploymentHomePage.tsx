import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight, 
  Calendar, 
  Users, 
  HeartHandshake, 
  BookOpen 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedSection from '@/components/AnimatedSection';
import UnifiedVideoPlayer from '@/components/UnifiedVideoPlayer';
import { InsuranceCarousel } from '@/components/InsuranceCarousel';
import InfoCard from '@/components/InfoCard';
import PrimaryLayout from '@/layouts/PrimaryLayout';
import DirectVimeoEmbed from '@/components/DirectVimeoEmbed';

/**
 * Deployment-optimized homepage that uses a more direct approach to video embedding
 * This is specifically designed to address the video playing issues in deployment
 */
export default function DeploymentHomePage() {
  // Define Vimeo video ID to use in deployment (replace with your actual Vimeo ID)
  const defaultVimeoId = '824804225'; // Default Vimeo ID
  
  // Fetch hero section content
  const { data: heroTitle } = useQuery({
    queryKey: ['/api/center/content/homepage_hero_title'],
  });

  const { data: heroSubtitle } = useQuery({
    queryKey: ['/api/center/content/homepage_hero_subtitle'],
  });
  
  // Fetch featured locations
  const { data: locations = [] } = useQuery({
    queryKey: ['/api/center/locations/featured'],
  });
  
  // Fetch treatments
  const { data: treatments = [] } = useQuery({
    queryKey: ['/api/center/treatments'],
  });
  
  // Fetch leadership staff
  const { data: leadershipStaff = [] } = useQuery({
    queryKey: ['/api/center/staff/leadership'],
  });
  
  // Fetch about us content
  const { data: aboutUsIntro } = useQuery({
    queryKey: ['/api/center/content/about_us_intro'],
  });
  
  // Fetch CTA section content
  const { data: ctaSection } = useQuery({
    queryKey: ['/api/center/content/homepage_cta_section'],
  });
  
  // Fetch section titles
  const { data: treatmentSectionTitle } = useQuery({
    queryKey: ['/api/center/content/homepage_treatment_section_title'],
  });
  
  const { data: locationsSectionTitle } = useQuery({
    queryKey: ['/api/center/content/homepage_locations_section_title'],
  });
  
  const { data: staffSectionTitle } = useQuery({
    queryKey: ['/api/center/content/homepage_staff_section_title'],
  });
  
  // For diagnostic purposes, log that we're using the deployment homepage
  useEffect(() => {
    console.log('DeploymentHomePage mounted - Using optimized video approach');
  }, []);
  
  return (
    <PrimaryLayout>
      {/* Hero Section with Optimized Video Background */}
      <section className="relative min-h-[600px] flex items-center text-white">
        {/* Direct Vimeo Embed - much more reliable in deployment */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <DirectVimeoEmbed
            videoId={defaultVimeoId}
            className="absolute inset-0 w-full h-full object-cover"
            autoplay={true}
            loop={true}
            muted={true}
            controls={false}
          />
          <div className="absolute inset-0 bg-black/50 z-10"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-20 py-20">
          <div className="max-w-2xl">
            <AnimatedSection animation="fade-up" duration={800}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">
                {heroTitle?.content || "Compassionate Eating Disorder Treatment"}
              </h1>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-up" delay={200} duration={800}>
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                {heroSubtitle?.content || "Begin your journey to recovery with personalized care and proven treatment approaches."}
              </p>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-up" delay={400} duration={800}>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-[#5a9e97] hover:bg-[#4a8e87] text-white border-none px-6"
                >
                  Get Started Today
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                >
                  Learn About Our Approach
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
      
      {/* Insurance Providers Section */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-800">
              We Accept Most Major Insurance Plans
            </h2>
            <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
              We're in-network with many insurance providers to make treatment more accessible. 
              Contact us to verify your coverage.
            </p>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up" delay={200}>
            <InsuranceCarousel />
          </AnimatedSection>
        </div>
      </section>
      
      {/* Treatment Programs Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-800">
              {treatmentSectionTitle?.content || "Our Treatment Programs"}
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              We offer comprehensive, evidence-based treatment programs tailored to each individual's needs.
            </p>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {treatments && treatments.length > 0 &&
              treatments.slice(0, 3).map((treatment, index) => (
                <AnimatedSection key={treatment.id} animation="fade-up" delay={index * 100 + 200}>
                  <div className="group h-full">
                    <div className="aspect-video relative overflow-hidden rounded-t-lg mb-4">
                      {treatment.imageUrl ? (
                        <img
                          src={treatment.imageUrl}
                          alt={treatment.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-[#5a9e97] transition-colors">
                      {treatment.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {treatment.description}
                    </p>
                    <Button
                      variant="link"
                      className="p-0 text-[#5a9e97] hover:text-[#4a8e87] font-medium flex items-center"
                    >
                      Learn More <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </AnimatedSection>
              ))}
          </div>
          
          <AnimatedSection animation="fade-up" delay={600}>
            <div className="flex justify-center mt-12">
              <Button className="bg-[#5a9e97] hover:bg-[#4a8e87]">
                View All Treatment Programs
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
      
      {/* Locations Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-800">
              {locationsSectionTitle?.content || "Our Locations"}
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              We provide treatment at convenient locations across the country, each offering our full range of services.
            </p>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations && locations.length > 0 && 
              locations.filter(location => location.featuredOnHomepage).map((location, index) => (
                <AnimatedSection key={location.id} animation="fade-up" delay={index * 100 + 200}>
                  <div className="group h-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video relative overflow-hidden">
                      {location.imageUrl ? (
                        <img
                          src={location.imageUrl}
                          alt={location.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <MapPin className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-[#5a9e97] transition-colors">
                        {location.name}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {location.description ? (
                          `${location.description.substring(0, 120)}${location.description.length > 120 ? '...' : ''}`
                        ) : (
                          "Contact us to learn more about the services offered at this location."
                        )}
                      </p>
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5 text-[#5a9e97]" />
                          <span>{location.address}, {location.city}, {location.state} {location.zipCode}</span>
                        </div>
                        <div className="flex items-start">
                          <Phone className="h-4 w-4 mr-2 mt-0.5 text-[#5a9e97]" />
                          <span>{location.phone}</span>
                        </div>
                        <div className="flex items-start">
                          <Mail className="h-4 w-4 mr-2 mt-0.5 text-[#5a9e97]" />
                          <span>{location.email}</span>
                        </div>
                      </div>
                      <Button
                        variant="link"
                        className="p-0 text-[#5a9e97] hover:text-[#4a8e87] font-medium flex items-center"
                      >
                        View Location <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
          </div>
          
          <AnimatedSection animation="fade-up" delay={600}>
            <div className="flex justify-center mt-12">
              <Button className="bg-[#5a9e97] hover:bg-[#4a8e87]">
                View All Locations
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
      
      {/* Core Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-800">
              {staffSectionTitle?.content || "Our Approach"}
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Our treatment philosophy is built on these core principles that guide everything we do.
            </p>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatedSection animation="fade-up" delay={100}>
              <InfoCard
                icon={<HeartHandshake className="h-8 w-8" />}
                title="Compassionate Care"
                content="We treat every person with dignity and respect, creating a safe space for healing and growth."
              />
            </AnimatedSection>
            
            <AnimatedSection animation="fade-up" delay={200}>
              <InfoCard
                icon={<Users className="h-8 w-8" />}
                title="Personalized Treatment"
                content="We develop individualized care plans tailored to each person's unique needs and circumstances."
              />
            </AnimatedSection>
            
            <AnimatedSection animation="fade-up" delay={300}>
              <InfoCard
                icon={<BookOpen className="h-8 w-8" />}
                title="Evidence-Based Methods"
                content="Our treatment approaches are grounded in the latest research and proven therapeutic techniques."
              />
            </AnimatedSection>
            
            <AnimatedSection animation="fade-up" delay={400}>
              <InfoCard
                icon={<Calendar className="h-8 w-8" />}
                title="Long-Term Support"
                content="We provide ongoing support and resources to help maintain recovery long after treatment ends."
              />
            </AnimatedSection>
          </div>
        </div>
      </section>
      
      {/* Our Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-800">
              Meet Our Leadership Team
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Our multidisciplinary team of experts is dedicated to providing the highest quality of care.
            </p>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {leadershipStaff && leadershipStaff.length > 0 &&
              leadershipStaff.slice(0, 3).map((staff, index) => (
                <AnimatedSection key={staff.id} animation="fade-up" delay={index * 100 + 200}>
                  <div className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-[4/5] relative overflow-hidden">
                      {staff.imageUrl ? (
                        <img
                          src={staff.imageUrl}
                          alt={staff.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-1 group-hover:text-[#5a9e97] transition-colors">
                        {staff.name}
                      </h3>
                      <p className="text-[#5a9e97] font-medium mb-3">
                        {staff.title}
                      </p>
                      <p className="text-gray-600 mb-4">
                        {staff.bio ? (
                          `${staff.bio.substring(0, 120)}${staff.bio.length > 120 ? '...' : ''}`
                        ) : (
                          "A dedicated member of our team committed to providing excellent care and treatment."
                        )}
                      </p>
                      <Button
                        variant="link"
                        className="p-0 text-[#5a9e97] hover:text-[#4a8e87] font-medium flex items-center"
                      >
                        View Profile <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
          </div>
          
          <AnimatedSection animation="fade-up" delay={600}>
            <div className="flex justify-center mt-12">
              <Button className="bg-[#5a9e97] hover:bg-[#4a8e87]">
                View Our Full Team
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
      
      {/* About Us Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="fade-right">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070&auto=format&fit=crop"
                  alt="Our mission"
                  className="w-full h-full object-cover"
                />
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
                About Complete Eating Care
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  {aboutUsIntro?.content || 
                    "Founded with a mission to provide comprehensive, compassionate care for individuals struggling with eating disorders, Complete Eating Care has grown into a leading treatment provider serving communities across the country."}
                </p>
                <p>
                  Our multidisciplinary team includes psychiatrists, therapists, dietitians, and medical professionals who work together to deliver personalized care that addresses all aspects of recovery.
                </p>
              </div>
              <div className="mt-8">
                <Button className="bg-[#5a9e97] hover:bg-[#4a8e87]">
                  Learn More About Us
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-[#005a8e] text-white">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection animation="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {ctaSection?.title || "Ready to Begin Your Recovery Journey?"}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              {ctaSection?.content || "Contact us today to speak with an admissions specialist who can guide you through the process and answer any questions you may have."}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-white text-[#005a8e] hover:bg-white/90 hover:text-[#005a8e] border-none"
              >
                Call Us Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
              >
                Request Information
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </PrimaryLayout>
  );
}