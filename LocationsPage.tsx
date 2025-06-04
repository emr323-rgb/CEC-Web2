import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Link } from 'wouter';
import { Location } from '@shared/schema';

export default function LocationsPage() {
  // Fetch locations data
  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ['/api/center/locations'],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Our Locations
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
          Complete Eating Care provides treatment at multiple locations to better serve our patients.
          Each center offers a full range of services in a healing environment.
        </p>
      </div>
      
      {/* Locations Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locations.map((location) => (
            <Card key={location.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="aspect-w-16 aspect-h-9 w-full">
                {location.imageUrl ? (
                  <img 
                    src={`${location.imageUrl}?v=${Date.now()}`} 
                    alt={location.name} 
                    className="object-cover w-full h-48"
                  />
                ) : (
                  <div className="bg-gray-200 flex items-center justify-center h-48">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 hover:text-primary transition-colors">
                  <Link href={`/locations/${location.id}`}>
                    {location.name}
                  </Link>
                </h3>
                <div className="flex flex-col space-y-3 mt-4">
                  {location.address && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{location.address}</span>
                    </div>
                  )}
                  
                  {location.phone && (
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{location.phone}</span>
                    </div>
                  )}
                  
                  {location.email && (
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{location.email}</span>
                    </div>
                  )}
                  
                  {location.openingHours && (
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{location.openingHours}</span>
                    </div>
                  )}
                </div>
                
                {location.description && (
                  <div className="mt-4">
                    <p className="text-gray-600 line-clamp-3">{location.description}</p>
                  </div>
                )}
                
                <div className="mt-6 flex justify-between items-center">
                  <Link href={`/locations/${location.id}`}>
                    <Button>
                      View Details
                    </Button>
                  </Link>
                  
                  {location.featuredOnHomepage && (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Featured Location
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}