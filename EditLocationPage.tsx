import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Location } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useRoute, useLocation } from 'wouter';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';

// Form validation schema for location data
const locationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Zip code is required'),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email('Valid email is required').optional().nullable(),
  description: z.string().optional().nullable(),
  openingHours: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  featuredOnHomepage: z.boolean().default(false),
  sortOrder: z.number().optional().nullable(),
  tagline: z.string().optional().nullable().default('Leading Eating Disorder Treatment')
});

type LocationFormValues = z.infer<typeof locationSchema>;

export default function EditLocationPage() {
  const [match, params] = useRoute<{ id: string }>('/admin/locations/edit/:id');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch location to edit
  const { data: location, isLoading: isLocationLoading } = useQuery<Location>({
    queryKey: [`/api/center/locations/${params?.id}`],
    enabled: !!params?.id,
  });

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: null,
      description: null,
      openingHours: null,
      imageUrl: null,
      featuredOnHomepage: false,
      sortOrder: 0,
      tagline: 'Leading Eating Disorder Treatment'
    }
  });

  // Update form with location data when it's loaded
  useEffect(() => {
    if (location) {
      form.reset({
        name: location.name,
        address: location.address,
        city: location.city,
        state: location.state,
        zipCode: location.zipCode,
        phone: location.phone,
        email: location.email,
        description: location.description,
        openingHours: location.openingHours,
        imageUrl: location.imageUrl,
        featuredOnHomepage: !!location.featuredOnHomepage,
        sortOrder: location.sortOrder || 0,
        tagline: location.tagline || 'Leading Eating Disorder Treatment'
      });
    }
  }, [location, form]);

  const onSubmit = async () => {
    if (!params?.id) return;
    
    setIsSaving(true);
    const values = form.getValues();
    console.log('Direct submitting with values:', values);
    
    try {
      // Use direct fetch with PUT method
      const response = await fetch(`/api/center/locations/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include'
      });
      
      console.log(`PUT response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }
      
      // Parse the response to JSON
      const updatedLocation = await response.json();
      console.log("Location updated successfully:", updatedLocation);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/center/locations'] });
      queryClient.invalidateQueries({ queryKey: [`/api/center/locations/${params.id}`] });
      
      toast({
        title: 'Location updated',
        description: 'The location has been updated successfully.',
      });
      
      // Navigate back to locations list
      navigate('/admin/locations');
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: 'Error',
        description: 'There was an error updating the location. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLocationLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center mb-8">
          <Button variant="outline" className="mr-4">
            <Link href="/admin/locations">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Locations
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-teal-800">Edit Location</h1>
        </div>
        <Card className="p-6">
          <CardContent className="p-8 flex justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-t-transparent border-teal-600" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="container py-10">
        <div className="flex items-center mb-8">
          <Button variant="outline" className="mr-4">
            <Link href="/admin/locations">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Locations
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-teal-800">Edit Location</h1>
        </div>
        <Card className="p-6">
          <CardContent className="p-8">
            <p className="text-center">Location not found. <Link href="/admin/locations" className="text-teal-600 underline">Return to location list</Link></p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center mb-8">
        <Button variant="outline" className="mr-4">
          <Link href="/admin/locations">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Locations
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-teal-800">Edit Location: {location.name}</h1>
      </div>

      <Card className="p-6">
        <CardContent className="pt-4">
          <Form {...form}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(555) 123-4567" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Leading Eating Disorder Treatment" />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      This tagline appears on the location page header
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123 Main St" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="openingHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Hours</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value || ''} 
                        placeholder="Monday-Friday: 9am-5pm, Saturday: 10am-2pm, Sunday: Closed" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="min-h-[150px]"
                        {...field}
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="https://example.com/image.jpg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="featuredOnHomepage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured Location</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Display this location prominently on the homepage
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          value={field.value || 0}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        Lower numbers appear first
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={() => navigate('/admin/locations')}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  disabled={isSaving}
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={onSubmit}
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent border-current"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}