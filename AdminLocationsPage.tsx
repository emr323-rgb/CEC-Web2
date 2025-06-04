import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Location } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Map, Phone, Clock, Mail } from 'lucide-react';
import { Link } from 'wouter';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

// Form validation schema for location data
const locationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Valid zip code is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required').nullable(),
  description: z.string().min(10, 'Description must be at least 10 characters').nullable(),
  openingHours: z.string().min(2, 'Hours of operation are required').nullable(),
  featuredOnHomepage: z.boolean().default(false),
  imageUrl: z.string().nullable(),
  sortOrder: z.number().optional()
});

type LocationFormValues = z.infer<typeof locationSchema>;

export default function AdminLocationsPage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const { toast } = useToast();
  
  // Fetch all locations
  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ['/api/center/locations'],
    queryFn: async () => {
      const response = await fetch('/api/center/locations');
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      return response.json();
    }
  });

  // Form setup for editing locations
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
      featuredOnHomepage: false,
      imageUrl: null
    }
  });

  // Form setup for adding new locations
  const addForm = useForm<LocationFormValues>({
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
      featuredOnHomepage: false,
      imageUrl: null
    }
  });

  // Handle edit location
  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    
    // Reset form with location data
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
      featuredOnHomepage: location.featuredOnHomepage === null ? false : location.featuredOnHomepage,
      imageUrl: location.imageUrl,
    });
    
    setIsEditDialogOpen(true);
  };

  // Submit handler for edit form
  const onSubmit = async (values: LocationFormValues) => {
    if (!selectedLocation) return;

    try {
      // Changed from PATCH to PUT to match the API endpoint
      await apiRequest('PUT', `/api/center/locations/${selectedLocation.id}`, values);
      queryClient.invalidateQueries({ queryKey: ['/api/center/locations'] });
      toast({
        title: 'Location Updated',
        description: `${values.name} has been successfully updated.`,
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: 'Error',
        description: 'Failed to update location. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Submit handler for add form
  const onAddSubmit = async (values: LocationFormValues) => {
    try {
      // Make sure we're using the correct endpoint
      await apiRequest('POST', '/api/center/locations', values);
      queryClient.invalidateQueries({ queryKey: ['/api/center/locations'] });
      toast({
        title: 'Location Added',
        description: `${values.name} has been successfully added.`,
      });
      setIsAddDialogOpen(false);
      addForm.reset();
    } catch (error) {
      console.error('Error adding location:', error);
      toast({
        title: 'Error',
        description: 'Failed to add location. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Locations</h1>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Location
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <Card key={location.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">{location.name}</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditLocation(location)}
                    className="text-teal-600 border-teal-600 hover:bg-teal-50"
                  >
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </div>
                
                <div className="space-y-3 text-slate-600">
                  <div className="flex items-start gap-2">
                    <Map className="h-4 w-4 mt-1 flex-shrink-0 text-teal-700" />
                    <div>
                      <p>{location.address}</p>
                      <p>{location.city}, {location.state} {location.zipCode}</p>
                    </div>
                  </div>
                  
                  {location.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 flex-shrink-0 text-teal-700" />
                      <p>{location.phone}</p>
                    </div>
                  )}
                  
                  {location.openingHours && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0 text-teal-700" />
                      <p>{location.openingHours}</p>
                    </div>
                  )}
                  
                  {location.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 flex-shrink-0 text-teal-700" />
                      <p className="truncate">{location.email}</p>
                    </div>
                  )}
                  
                  {location.featuredOnHomepage && (
                    <div className="mt-3">
                      <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Featured on Homepage
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Location Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start">
            <DialogHeader className="p-0">
              <DialogTitle>Edit Location</DialogTitle>
              <DialogDescription>
                Update the details for {selectedLocation?.name}
              </DialogDescription>
            </DialogHeader>
            
            <Button 
              type="submit" 
              form="editLocationForm" 
              className="bg-teal-600 hover:bg-teal-700 mt-0"
            >
              Save Changes
            </Button>
          </div>
          
          <div className="border-t mt-4 pt-4">
            <Form {...form}>
              <form id="editLocationForm" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-4 pr-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Location name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
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
                            <Input placeholder="12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@example.com" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="openingHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hours of Operation</FormLabel>
                        <FormControl>
                          <Input placeholder="Mon-Fri: 9am-5pm, Sat: 10am-2pm" {...field} value={field.value || ''} />
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
                            placeholder="Describe the location and services offered" 
                            className="min-h-[100px]"
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
                          <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="featuredOnHomepage"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Featured Location</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            This location will be highlighted on the homepage
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add Location Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start">
            <DialogHeader className="p-0">
              <DialogTitle>Add New Location</DialogTitle>
              <DialogDescription>
                Enter the details for the new location
              </DialogDescription>
            </DialogHeader>
            
            <Button 
              type="submit" 
              form="addLocationForm" 
              className="bg-teal-600 hover:bg-teal-700 mt-0"
            >
              Add Location
            </Button>
          </div>
          
          <div className="border-t mt-4 pt-4">
            <Form {...addForm}>
              <form id="addLocationForm" onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <div className="space-y-4 pr-2">
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Location name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@example.com" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={addForm.control}
                    name="openingHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hours of Operation</FormLabel>
                        <FormControl>
                          <Input placeholder="Mon-Fri: 9am-5pm, Sat: 10am-2pm" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the location and services offered" 
                            className="min-h-[100px]"
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="featuredOnHomepage"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Featured Location</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            This location will be highlighted on the homepage
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}