import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Info, Calendar, Map } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Staff, Treatment, LocationWithDetails } from '@shared/schema';

export default function LocationDetailPage() {
  // Get location ID from URL
  const [, params] = useRoute('/locations/:id');
  const locationId = params ? parseInt(params.id) : null;
  
  // Fetch location data with staff and treatments
  const { data: locationData, isLoading, error } = useQuery<LocationWithDetails>({
    queryKey: [`/api/center/locations/${locationId}`],
    enabled: !!locationId,
    queryFn: async () => {
      if (!locationId) throw new Error("No location ID provided");
      console.log(`Fetching location details for ID: ${locationId}`);
      
      const response = await fetch(`/api/center/locations/${locationId}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching location:", errorText);
        throw new Error(`Failed to fetch location: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Location data fetched successfully:", data);
      return data;
    }
  });
  
  // Debug information
  console.log("Location ID:", locationId);
  console.log("Location data:", locationData);
  console.log("Loading status:", isLoading);
  console.log("Error:", error);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!locationData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold">Location not found</h2>
        <p className="mt-4">The location you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        <div className="lg:w-1/2">
          <h1 className="text-4xl font-bold text-gray-900">{locationData.name}</h1>
          <div className="flex flex-col space-y-3 mt-6">
            {locationData.address && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600">{locationData.address}</span>
              </div>
            )}
            
            {locationData.phone && (
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600">{locationData.phone}</span>
              </div>
            )}
            
            {locationData.email && (
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600">{locationData.email}</span>
              </div>
            )}
            
            {locationData.openingHours && (
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600">{locationData.openingHours}</span>
              </div>
            )}
          </div>
          
          {locationData.description && (
            <div className="mt-6 prose">
              <p className="text-gray-600">{locationData.description}</p>
            </div>
          )}
          
          <div className="mt-8">
            <Button className="mr-4">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule a Tour
            </Button>
            <Button variant="outline">
              <Map className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
          </div>
        </div>
        
        <div className="lg:w-1/2">
          {locationData.imageUrl ? (
            <img 
              src={`${locationData.imageUrl}?v=${Date.now()}`} 
              alt={locationData.name} 
              className="w-full h-80 object-cover rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-80 bg-gray-200 flex items-center justify-center rounded-lg">
              <Info className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
      </div>
      
      {/* Tabs for Staff, Treatments, etc */}
      <Tabs defaultValue="staff" className="mt-12">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="staff">Our Staff</TabsTrigger>
          <TabsTrigger value="treatments">Treatment Programs</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        </TabsList>
        
        {/* Staff Tab */}
        <TabsContent value="staff" className="mt-8">
          <h2 className="text-2xl font-bold text-center mb-8">Meet Our Team at {locationData.name}</h2>
          
          {locationData.staff && locationData.staff.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {locationData.staff.map((member: Staff) => (
                <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-w-1 aspect-h-1 w-full">
                    {member.imageUrl ? (
                      <img 
                        src={`${member.imageUrl}?v=${Date.now()}`} 
                        alt={member.name} 
                        className="object-cover w-full h-64"
                      />
                    ) : (
                      <div className="bg-gray-200 flex items-center justify-center h-64">
                        <span className="text-gray-400">No image available</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-primary mb-2">{member.title}</p>
                    {member.specialty && (
                      <div className="mb-3">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                          {member.specialty}
                        </span>
                      </div>
                    )}
                    <p className="text-gray-600 mb-4 line-clamp-3">{member.bio}</p>
                    <div className="flex flex-col space-y-2">
                      {member.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">{member.email}</span>
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">{member.phone}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No staff members are currently assigned to this location.</p>
            </div>
          )}
        </TabsContent>
        
        {/* Treatments Tab */}
        <TabsContent value="treatments" className="mt-8">
          <h2 className="text-2xl font-bold text-center mb-8">Treatment Programs at {locationData.name}</h2>
          
          {locationData.treatments && locationData.treatments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {locationData.treatments.map((treatment: Treatment) => (
                <Card key={treatment.id} className="overflow-hidden hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900">{treatment.name}</h3>
                    <p className="text-gray-600 mt-3">{treatment.description}</p>
                    <div className="mt-4 flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        Contact us for program duration information
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No treatment programs are currently available at this location.</p>
            </div>
          )}
        </TabsContent>
        
        {/* Testimonials Tab */}
        <TabsContent value="testimonials" className="mt-8">
          <h2 className="text-2xl font-bold text-center mb-8">Patient Success Stories</h2>
          
          {locationData.testimonials && locationData.testimonials.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {locationData.testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="overflow-hidden hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                        {testimonial.author.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium">{testimonial.author}</h3>
                        <p className="text-sm text-gray-500">Former Patient</p>
                      </div>
                    </div>
                    <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No testimonials are currently available for this location.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}