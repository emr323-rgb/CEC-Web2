import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { InsuranceProvider } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

export function InsuranceCarousel() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { data: insuranceProviders, isLoading, error } = useQuery<InsuranceProvider[]>({
    queryKey: ['/api/center/insurance-providers'],
    enabled: mounted,
  });

  if (isLoading) {
    return (
      <div className="w-full bg-transparent relative">
        <h2 className="text-2xl lg:text-3xl font-bold text-center text-gray-800 mb-4">
          Insurance Providers We Accept
        </h2>
        <div className="text-center mb-3 text-gray-600">
          <span>Scroll to see more accepted insurance providers</span>
          <div className="flex justify-center mt-1">
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-1.5 w-6 rounded-full bg-[#5a9e97] opacity-60"></div>
              ))}
            </div>
          </div>
        </div>
        <Carousel>
          <CarouselContent className="px-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <CarouselItem key={i} className="md:basis-1/3 lg:basis-1/5 pl-4 pr-8">
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white relative overflow-hidden">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Skeleton className="h-24 w-36 mb-4" />
                    <Skeleton className="h-4 w-28" />
                  </CardContent>
                  <div className="absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent"></div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="md:flex bg-white border border-[#5a9e97] text-[#5a9e97] hover:bg-[#5a9e97] hover:text-white transition-colors shadow-md left-1" />
          <CarouselNext className="md:flex bg-white border border-[#5a9e97] text-[#5a9e97] hover:bg-[#5a9e97] hover:text-white transition-colors shadow-md right-1" />
        </Carousel>
        <div className="hidden md:block text-center mt-4">
          <span className="text-sm text-[#5a9e97] font-medium">Click the arrows to see more insurance providers</span>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Error loading insurance providers:", error);
    return null;
  }

  if (!insuranceProviders || insuranceProviders.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-transparent relative">
      <h2 className="text-2xl lg:text-3xl font-bold text-center text-gray-800 mb-4">
        Insurance Providers We Accept
      </h2>
      <div className="text-center mb-3 text-gray-600">
        <span>Scroll to see more accepted insurance providers</span>
        <div className="flex justify-center mt-1">
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, Math.ceil(insuranceProviders.length / 5)) }).map((_, i) => (
              <div key={i} className="h-1.5 w-6 rounded-full bg-[#5a9e97] opacity-60"></div>
            ))}
          </div>
        </div>
      </div>
      <Carousel>
        <CarouselContent className="px-2">
          {insuranceProviders.map((provider) => (
            <CarouselItem key={provider.id} className="md:basis-1/3 lg:basis-1/5 pl-4 pr-8">
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white relative overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <a 
                    href={provider.websiteUrl || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                  >
                    <div className="h-24 flex items-center justify-center mb-4">
                      <img 
                        src={`${provider.logoUrl || ""}?v=${Date.now()}`} 
                        alt={`${provider.name} logo`} 
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          console.error(`Failed to load image: ${provider.logoUrl}`);
                          e.currentTarget.src = "https://placehold.co/200x100/5a9e97/white?text=" + encodeURIComponent(provider.name);
                        }}
                      />
                    </div>
                    <p className="text-center font-medium">{provider.name}</p>
                  </a>
                </CardContent>
                {/* Gradient fade on sides to indicate more content */}
                <div className="absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent"></div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="md:flex bg-white border border-[#5a9e97] text-[#5a9e97] hover:bg-[#5a9e97] hover:text-white transition-colors shadow-md left-1" />
        <CarouselNext className="md:flex bg-white border border-[#5a9e97] text-[#5a9e97] hover:bg-[#5a9e97] hover:text-white transition-colors shadow-md right-1" />
      </Carousel>
      <div className="hidden md:block text-center mt-4">
        <span className="text-sm text-[#5a9e97] font-medium">Click the arrows to see more insurance providers</span>
      </div>
    </div>
  );
}

export function InsuranceCarouselAdmin() {
  const { data: insuranceProviders, isLoading, error } = useQuery<InsuranceProvider[]>({
    queryKey: ['/api/center/insurance-providers'],
  });

  if (isLoading) {
    return (
      <div className="w-full py-10">
        <h2 className="text-2xl font-bold mb-6">Insurance Providers</h2>
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 w-64">
              <Skeleton className="h-20 w-36 mb-4 mx-auto" />
              <Skeleton className="h-4 w-28 mx-auto mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Error loading insurance providers:", error);
    return <div>Error loading insurance providers. Please try again later.</div>;
  }

  return (
    <div className="w-full py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Insurance Providers</h2>
        <button
          className="btn bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          onClick={() => {
            // TODO: Open add insurance provider dialog
          }}
        >
          Add Provider
        </button>
      </div>
      
      <div className="flex flex-wrap gap-4">
        {insuranceProviders?.map((provider) => (
          <div key={provider.id} className="border rounded-lg p-4 w-64">
            <div className="h-20 flex items-center justify-center mb-4">
              <img 
                src={`${provider.logoUrl || ""}?v=${Date.now()}`} 
                alt={`${provider.name} logo`} 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <h3 className="text-center font-medium mb-2">{provider.name}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{provider.description}</p>
            <div className="flex justify-between">
              <button
                className="text-blue-600 hover:text-blue-800"
                onClick={() => {
                  // TODO: Open edit insurance provider dialog
                }}
              >
                Edit
              </button>
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => {
                  // TODO: Open delete insurance provider dialog
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}