import React from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Phone, Mail, Clock, Users, Stethoscope, MessageSquareQuote } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function LocationDetail() {
  const [match, params] = useRoute("/locations/:id");
  const locationId = params?.id ? parseInt(params.id) : 0;

  const { data: location, isLoading } = useQuery({
    queryKey: [`/api/center/locations/${locationId}`],
    enabled: !!locationId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/locations">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Locations
            </Button>
          </Link>
        </div>
        
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-40" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/locations">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Locations
            </Button>
          </Link>
        </div>
        
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Location Not Found</h1>
          <p className="text-gray-600 mb-6">The location you're looking for doesn't exist or has been removed.</p>
          <Link href="/locations">
            <Button>View All Locations</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/locations">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Locations
          </Button>
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{location.name}</h1>
        <h2 className="text-2xl text-teal-700 font-medium mb-2">{location.tagline || "Leading Eating Disorder Treatment"}</h2>
        <p className="text-xl text-gray-600">{location.city}, {location.state}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          {location.imageUrl ? (
            <img 
              src={location.imageUrl} 
              alt={location.name} 
              className="w-full h-64 object-cover rounded-xl mb-6" 
            />
          ) : (
            <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
              <MapPin size={48} className="text-gray-300" />
            </div>
          )}
          
          <div className="prose max-w-none">
            <p className="text-lg">
              {location.description || `Our ${location.name} location offers comprehensive eating disorder treatment services in a supportive and healing environment. Our team of specialists works together to provide personalized care for each patient.`}
            </p>
          </div>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-gray-600">{location.address}, {location.city}, {location.state} {location.zipCode}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600">{location.phone}</p>
                </div>
              </div>
              
              {location.email && (
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{location.email}</p>
                  </div>
                </div>
              )}
              
              {location.openingHours && (
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Hours</p>
                    <p className="text-gray-600">{location.openingHours}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full">Contact This Location</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Tabs defaultValue="treatments" className="w-full mb-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="treatments" className="flex gap-2 items-center">
            <Stethoscope size={16} />
            Treatments
          </TabsTrigger>
          <TabsTrigger value="team" className="flex gap-2 items-center">
            <Users size={16} />
            Our Team
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="flex gap-2 items-center">
            <MessageSquareQuote size={16} />
            Testimonials
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="treatments" className="pt-6">
          <h2 className="text-2xl font-bold mb-6">Available Treatments</h2>
          {location.treatments && location.treatments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {location.treatments.map((treatment: any) => (
                <Card key={treatment.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Stethoscope size={20} className="text-primary" />
                      <CardTitle className="text-xl">{treatment.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {treatment.description || "Specialized treatment program tailored to individual needs, provided by our experienced care team."}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/treatments/${treatment.id}`}>
                      <Button variant="outline" className="w-full">Learn More</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">No specific treatments listed for this location. Please contact us for more information about available programs.</p>
          )}
        </TabsContent>
        
        <TabsContent value="team" className="pt-6">
          <h2 className="text-2xl font-bold mb-6">Our Treatment Team</h2>
          {location.staff && location.staff.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {location.staff.map((staff: any) => (
                <div key={staff.id} className="flex flex-col items-center text-center">
                  {staff.imageUrl ? (
                    <img 
                      src={staff.imageUrl} 
                      alt={staff.name} 
                      className="h-40 w-40 object-cover rounded-full mb-4 border-2 border-primary"
                    />
                  ) : (
                    <div className="h-40 w-40 rounded-full bg-gray-200 flex items-center justify-center mb-4 border-2 border-primary">
                      <Users size={50} className="text-gray-400" />
                    </div>
                  )}
                  <h3 className="font-bold text-xl mb-1">{staff.name}</h3>
                  <p className="text-primary font-medium mb-3">{staff.title}</p>
                  {staff.specialty && (
                    <p className="text-gray-500 mb-3 text-sm">{staff.specialty}</p>
                  )}
                  <p className="text-gray-600 text-sm max-w-md">
                    {staff.bio ? (
                      staff.bio
                    ) : (
                      "Dedicated professional with expertise in eating disorder treatment and patient care."
                    )}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">Staff information coming soon. Please contact us to learn more about our treatment team.</p>
          )}
        </TabsContent>
        
        <TabsContent value="testimonials" className="pt-6">
          <h2 className="text-2xl font-bold mb-6">Patient Testimonials</h2>
          {location.testimonials && location.testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {location.testimonials.map((testimonial: any) => (
                <Card key={testimonial.id} className="bg-gray-50">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      <MessageSquareQuote size={32} className="text-primary opacity-50" />
                      <p className="text-lg italic">{testimonial.quote}</p>
                      <Separator />
                      <p className="font-medium">- {testimonial.author}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">Testimonials coming soon. We're committed to helping our patients achieve lasting recovery.</p>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="bg-primary/5 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Begin Your Recovery Journey?</h2>
        <p className="max-w-2xl mx-auto mb-6">
          Our team at {location.name} is ready to help you or your loved one start the path to recovery. 
          Reach out today to learn more about our programs and treatment options.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg">Schedule a Consultation</Button>
          <Button size="lg" variant="outline">Call {location.phone}</Button>
        </div>
      </div>
    </div>
  );
}