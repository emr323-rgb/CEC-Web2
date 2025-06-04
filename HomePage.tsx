import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { MapPin, Phone, Mail, ArrowRight, Users, Stethoscope, Heart, Brain, Home, Sparkles, HelpingHand, ChevronDown } from "lucide-react";
import logoImg from '@assets/CEC logo.png';
import { InsuranceCarousel } from "@/components/InsuranceCarousel";
import SimpleVideoPlayer from "@/components/SimpleVideoPlayer";
import { generateVideoSources, setupEnhancedAutoplay } from "@/lib/videoHelpers";
import EnhancedVideoPlayer from "@/components/EnhancedVideoPlayer";
import CompressedVideoBanner from "@/components/CompressedVideoBanner";

export default function HomePage() {
  // Fetch homepage content
  const { data: heroTitleContent = {}, isLoading: isLoadingHeroTitle } = useQuery({
    queryKey: ['/api/center/content/homepage_hero_title'],
  });
  
  const { data: heroSubtitleContent = {}, isLoading: isLoadingHeroSubtitle } = useQuery({
    queryKey: ['/api/center/content/homepage_hero_subtitle'],
  });
  
  const { data: heroVideoContent = {}, isLoading: isLoadingHeroVideo } = useQuery({
    queryKey: ['/api/center/content/homepage_hero_video'],
  });
  
  // Load our large XL video for the hero section
  const { data: xlVideoContent = {}, isLoading: isLoadingXlVideo } = useQuery({
    queryKey: ['/api/center/content/test_xl_video'],
    // Add staleTime to prevent unnecessary refetches
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Add retry attempts for better reliability in production
    retry: 3,
    retryDelay: 1000,
  });

  const { data: treatmentSectionContent = {}, isLoading: isLoadingTreatmentSection } = useQuery({
    queryKey: ['/api/center/content/homepage_treatment_section_title'],
  });
  
  const { data: locationsSectionContent = {}, isLoading: isLoadingLocationsSection } = useQuery({
    queryKey: ['/api/center/content/homepage_locations_section_title'],
  });
  
  const { data: staffSectionContent = {}, isLoading: isLoadingStaffSection } = useQuery({
    queryKey: ['/api/center/content/homepage_staff_section_title'],
  });
  
  const { data: aboutContent = {}, isLoading: isLoadingAbout } = useQuery({
    queryKey: ['/api/center/content/about_us_intro'],
  });
  
  const { data: ctaSectionContent = {}, isLoading: isLoadingCtaSection } = useQuery({
    queryKey: ['/api/center/content/homepage_cta_section'],
  });
  
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['/api/center/locations/featured'],
  });

  const { data: treatments = [], isLoading: isLoadingTreatments } = useQuery({
    queryKey: ['/api/center/treatments'],
  });

  const { data: leadershipStaff = [], isLoading: isLoadingStaff } = useQuery({
    queryKey: ['/api/center/staff/leadership'],
  });
  
  // Create refs for video elements
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  
  // Simplify our approach with the standard video filename
  const videoFilename = "1747085170331-de1083e273f9130e.mp4";
  
  useEffect(() => {
    // Log when component mounts for debugging
    console.log("HomePage mounted with DeploymentAwareVideo component");
    
    // Simple cleanup function
    return () => {
      console.log("HomePage unmounted");
    };
  }, []);

  return (
    <div className="mx-auto w-full">
      {/* Hero Section with Full-Screen Video */}
      <section className="full-width-video-section mb-16">
        {/* Logo and Heading Overlay */}
        <div className="absolute top-0 left-0 w-full z-10 pt-8">
          <div className="container mx-auto px-4">
            <ScrollAnimation animationType="fade" duration={0.8}>
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="bg-white/90 rounded-full p-3 shadow-lg">
                  <img 
                    src={logoImg} 
                    alt="Complete Eating Care Logo" 
                    className="w-auto h-16 md:h-20"
                  />
                </div>
                <h1 className="logo-font text-3xl md:text-4xl mt-4 mb-2 tracking-wider text-white drop-shadow-md">
                  COMPLETE EATING CARE
                </h1>
              </div>
            </ScrollAnimation>
            <ScrollAnimation animationType="fade" delay={0.2}>
              <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 font-light text-white text-center drop-shadow-md">
                {heroSubtitleContent?.content || "Compassionate, comprehensive treatment for eating disorders"}
              </p>
            </ScrollAnimation>
          </div>
        </div>
        
        {/* Hero Video Section */}
        <div className="relative w-full h-screen max-h-[800px] min-h-[600px]">
          {/* Deployment-aware banner with static image fallback */}
          <CompressedVideoBanner />
          
          {/* Enhanced video player for development/preview */}
          <div className="absolute inset-0 overflow-hidden bg-[#5a9e97]/40">
            <EnhancedVideoPlayer 
              src={`/uploads/videos/${videoFilename}`}
              className="absolute inset-0 w-full h-full object-cover"
              autoplay={true}
              muted={true}
              loop={true}
              controls={false}
            />
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="absolute bottom-12 left-0 w-full z-10">
          <ScrollAnimation animationType="fade" direction="up" delay={0.5}>
            <div className="max-w-3xl mx-auto bg-black/30 backdrop-blur-sm p-4 rounded-2xl">
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Button size="lg" className="bg-[#5a9e97] text-white hover:bg-[#4a8e87] font-bold text-lg py-6 px-8 shadow-xl border-2 border-white">
                  Get Help Now
                </Button>
                <Link href="/locations">
                  <Button variant="outline" size="lg" className="border-[#5a9e97] bg-white/90 text-[#5a9e97] hover:bg-white font-bold text-lg py-6 px-8 shadow-xl">
                    Find a Location <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>
      
      {/* Insurance Carousel Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center mb-8">
          <ScrollAnimation animationType="fade">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Insurance Providers</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We work with many major insurance providers to make care accessible.
            </p>
          </ScrollAnimation>
        </div>
        <div className="container mx-auto px-4">
          <ScrollAnimation animationType="fade" delay={0.2}>
            <InsuranceCarousel />
          </ScrollAnimation>
        </div>
      </section>
      
      {/* Treatment Programs Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <ScrollAnimation animationType="fade">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                {treatmentSectionContent?.title || "Our Treatment Programs"}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {treatmentSectionContent?.content || "We offer a comprehensive range of specialized programs designed to meet your unique needs at every stage of recovery."}
              </p>
            </div>
          </ScrollAnimation>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoadingTreatments ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="shadow-md h-full flex flex-col">
                  <Skeleton className="h-40 w-full rounded-t-lg" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full rounded-md" />
                  </CardFooter>
                </Card>
              ))
            ) : treatments && treatments.length > 0 ? (
              treatments.slice(0, 3).map((treatment: any) => (
                <ScrollAnimation key={treatment.id} animationType="fade-up" cascade>
                  <Card className="shadow-md h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                    <div className="h-48 overflow-hidden">
                      {treatment.imageUrl ? (
                        <img 
                          src={treatment.imageUrl} 
                          alt={treatment.name} 
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Stethoscope className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-primary">{treatment.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-gray-600 line-clamp-3">{treatment.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/treatments/${treatment.id}`} className="w-full">
                        <Button className="w-full bg-primary hover:bg-primary-dark">
                          Learn More <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </ScrollAnimation>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">No treatment programs found.</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/treatments">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                View All Treatment Programs <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Locations Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <ScrollAnimation animationType="fade">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                {locationsSectionContent?.title || "Our Locations"}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {locationsSectionContent?.content || "With multiple locations across the country, we provide accessible care where you need it."}
              </p>
            </div>
          </ScrollAnimation>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoadingLocations ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="shadow-md h-full flex flex-col">
                  <Skeleton className="h-40 w-full rounded-t-lg" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full rounded-md" />
                  </CardFooter>
                </Card>
              ))
            ) : locations && locations.length > 0 ? (
              locations.slice(0, 3).map((location: any) => (
                <ScrollAnimation key={location.id} animationType="fade-up" cascade>
                  <Card className="shadow-md h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                    <div className="h-48 overflow-hidden">
                      {location.imageUrl ? (
                        <img 
                          src={`${location.imageUrl}?t=${Date.now()}`}
                          alt={location.name} 
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <MapPin className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-primary">{location.name}</CardTitle>
                      <CardDescription>{location.tagline || "Comprehensive eating disorder treatment"}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <p className="text-gray-600">{location.address}, {location.city}, {location.state} {location.zipCode}</p>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-primary mr-2" />
                          <p className="text-gray-600">{location.phone}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/locations/${location.id}`} className="w-full">
                        <Button className="w-full bg-primary hover:bg-primary-dark">
                          View Location <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </ScrollAnimation>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">No locations found.</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/locations">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                View All Locations <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Leadership Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <ScrollAnimation animationType="fade">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                {staffSectionContent?.title || "Leadership"}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {staffSectionContent?.content || "Meet our dedicated team of professionals committed to your recovery."}
              </p>
            </div>
          </ScrollAnimation>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoadingStaff ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="shadow-xl flex flex-col items-center text-center p-6 bg-white border-2 border-primary/20 h-[380px]">
                  <Skeleton className="h-32 w-32 rounded-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="mt-auto">
                    <Skeleton className="h-9 w-28 rounded-md" />
                  </div>
                </Card>
              ))
            ) : leadershipStaff && leadershipStaff.length > 0 ? (
              leadershipStaff.map((staff: any) => (
                <ScrollAnimation key={staff.id} animationType="fade-up" cascade>
                  <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center text-center p-6 bg-white border-2 border-primary/20 h-[380px]">
                    <div className="mb-4 w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
                      {staff.imageUrl ? (
                        <img 
                          src={staff.imageUrl}
                          alt={staff.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Users className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl font-bold text-primary mb-1">{staff.name}</CardTitle>
                    <CardDescription className="text-gray-600 mb-4">{staff.title}</CardDescription>
                    {staff.bio && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">{staff.bio}</p>
                    )}
                    <div className="mt-auto">
                      <Link href={`/staff/${staff.id}`}>
                        <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white font-bold">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </ScrollAnimation>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">No staff members found.</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/staff">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                Meet Our Full Team <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* About/Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollAnimation animationType="fade" direction="right">
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-primary text-center md:text-left">About Complete Eating Care</h2>
                <div className="bg-white p-8 rounded-lg shadow-xl border-2 border-primary">
                  <p className="text-xl font-medium leading-relaxed text-gray-700">
                    {aboutContent?.content || 
                      "Complete Eating Care is dedicated to providing comprehensive, compassionate care for individuals struggling with eating disorders. "}
                  </p>
                  <div className="mt-6 bg-primary p-4 rounded-md shadow-md">
                    <p className="text-2xl font-bold leading-relaxed text-white">
                      Our evidence-based approach creates personalized treatment plans to address the unique needs of each individual.
                    </p>
                  </div>
                </div>
                <div className="pt-6 text-center md:text-left">
                  <Link href="/about">
                    <Button className="bg-primary text-white hover:bg-primary-dark shadow-xl border-2 border-primary px-6 py-3 text-lg font-bold">
                      Learn More About Us <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollAnimation>
            
            <ScrollAnimation animationType="fade" direction="left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-xl border-2 border-primary h-64 flex flex-col">
                  <div className="bg-primary rounded-full w-20 h-20 flex items-center justify-center mb-4 mx-auto">
                    <Heart className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-primary text-center">Personalized Care</h3>
                  <p className="text-gray-700 flex-grow text-center">Treatment plans tailored to your unique needs and recovery goals.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-xl border-2 border-primary h-64 flex flex-col">
                  <div className="bg-primary rounded-full w-20 h-20 flex items-center justify-center mb-4 mx-auto">
                    <Brain className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-primary text-center">Evidence-Based</h3>
                  <p className="text-gray-700 flex-grow text-center">Treatments grounded in the latest research and clinical best practices.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-xl border-2 border-primary h-64 flex flex-col">
                  <div className="bg-primary rounded-full w-20 h-20 flex items-center justify-center mb-4 mx-auto">
                    <HelpingHand className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-primary text-center">Supportive Community</h3>
                  <p className="text-gray-700 flex-grow text-center">Build connections with peers and professionals who understand your journey.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-xl border-2 border-primary h-64 flex flex-col">
                  <div className="bg-primary rounded-full w-20 h-20 flex items-center justify-center mb-4 mx-auto">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-primary text-center">Holistic Approach</h3>
                  <p className="text-gray-700 flex-grow text-center">Addressing all aspects of wellbeing: physical, emotional, and social.</p>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <ScrollAnimation animationType="fade">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {ctaSectionContent?.title || "Begin Your Recovery Journey Today"}
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {ctaSectionContent?.content || "Take the first step toward healing. Our compassionate team is ready to guide you through every stage of recovery."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary-dark text-white py-6 px-8 text-lg">
                  Contact Us Now
                </Button>
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white py-6 px-8 text-lg">
                  Free Assessment
                </Button>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
}