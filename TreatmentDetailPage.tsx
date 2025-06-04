import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { ArrowLeft, MapPin, Phone } from "lucide-react";
import { Treatment } from "@shared/schema";

export default function TreatmentDetailPage() {
  // Extract the treatment ID from the URL
  const [, params] = useRoute("/treatments/:id");
  const treatmentId = params?.id ? parseInt(params.id, 10) : null;

  // Fetch the treatment details
  const { data: treatment, isLoading } = useQuery<Treatment>({
    queryKey: ['/api/center/treatments', treatmentId],
    queryFn: async () => {
      if (!treatmentId) throw new Error("Invalid treatment ID");
      const res = await fetch(`/api/center/treatments/${treatmentId}`);
      if (!res.ok) throw new Error("Failed to fetch treatment details");
      return res.json();
    },
    enabled: !!treatmentId,
  });

  // Fetch the locations that offer this treatment
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['/api/center/locations/by-treatment', treatmentId],
    queryFn: async () => {
      if (!treatmentId) throw new Error("Invalid treatment ID");
      const res = await fetch(`/api/center/locations/by-treatment/${treatmentId}`);
      if (!res.ok) return []; // If the API isn't implemented yet, just return empty array
      return res.json();
    },
    enabled: !!treatmentId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-64 w-full mb-6 rounded-lg" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-10" />
        
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!treatment) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Treatment Not Found</h1>
        <p className="text-gray-600 mb-6">The treatment program you're looking for doesn't exist or has been removed.</p>
        <Link href="/treatments">
          <Button>Back to All Treatment Programs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/treatments">
        <Button variant="link" className="mb-4 -ml-4">
          <ArrowLeft size={20} className="mr-2" /> Back to All Treatments
        </Button>
      </Link>

      <ScrollAnimation animationType="fade">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-[#333]">{treatment.name}</h1>
        
        {treatment.imageUrl && (
          <div className="w-full max-h-[400px] overflow-hidden rounded-lg mb-8">
            <img 
              src={treatment.imageUrl} 
              alt={treatment.name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-[#555] leading-relaxed">
            {treatment.description || "No description available."}
          </p>
        </div>
      </ScrollAnimation>

      {locations.length > 0 && (
        <ScrollAnimation animationType="fade" direction="up">
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-[#333]">
              Locations Offering This Treatment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {locations.map((location: any) => (
                <div 
                  key={location.id} 
                  className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-semibold mb-3">{location.name}</h3>
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin size={18} className="text-[#5a9e97] mt-1 shrink-0" />
                    <p className="text-gray-600">
                      {location.address}, {location.city}, {location.state} {location.zipCode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Phone size={18} className="text-[#5a9e97] shrink-0" />
                    <p className="text-gray-600">{location.phone}</p>
                  </div>
                  <Link href={`/locations/${location.id}`}>
                    <Button size="sm">View Location</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </ScrollAnimation>
      )}

      <div className="mt-12 bg-[#f8f9fa] p-8 rounded-lg border">
        <h2 className="text-2xl font-bold mb-4 text-[#333]">
          Get Started Today
        </h2>
        <p className="text-[#555] mb-6">
          Our admissions team is available to answer your questions and help you begin your recovery journey. 
          Contact us today to learn more about our {treatment.name} program.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button className="bg-[#5a9e97] hover:bg-[#4a8e87]">
            Contact Us
          </Button>
          <Link href="/insurance">
            <Button variant="outline" className="border-[#5a9e97] text-[#5a9e97]">
              Verify Insurance
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}