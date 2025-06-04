import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone } from 'lucide-react';
import { Staff } from '@shared/schema';

export default function TeamPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Fetch leadership staff data
  const { data: staff, isLoading } = useQuery<Staff[]>({
    queryKey: ['/api/center/staff/leadership'],
  });

  // Get unique categories for filtering
  const uniqueCategories = new Set<string>();
  
  // Safely collect categories
  if (staff) {
    staff.forEach(member => {
      if (member.specialty) {
        uniqueCategories.add(member.specialty);
      }
    });
  }
  
  const categories = Array.from(uniqueCategories);
  
  // Filter staff based on selected category
  const filteredStaff = selectedCategory 
    ? staff?.filter(member => member.specialty === selectedCategory)
    : staff;
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Our Leadership
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
          Meet the experienced leaders guiding our treatment approach and clinical excellence.
          Each member brings extensive expertise and passion to their role in supporting patients' recovery journeys.
        </p>
      </div>
      
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        <Button 
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
        >
          All Leadership
        </Button>
        {categories.map(category => (
          <Button 
            key={category} 
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
      
      {/* Staff Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStaff?.map((member) => (
            <Card key={member.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="aspect-w-1 aspect-h-1 w-full">
                {member.imageUrl ? (
                  <img 
                    src={member.imageUrl} 
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
      )}
    </div>
  );
}