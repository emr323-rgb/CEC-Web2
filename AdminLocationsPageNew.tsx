import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Location, insertLocationSchema } from "@shared/schema";
import { z } from "zod";
import { SimpleAddLocationForm } from "./SimpleAddLocationForm";
import LocationImageUploadWithCrop from "@/components/admin/LocationImageUploadWithCrop";

type LocationFormValues = z.infer<typeof insertLocationSchema>;

export default function AdminLocationsPageNew() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  
  // Fetch locations data
  const { data: locations = [], isLoading } = useQuery<Location[]>({ 
    queryKey: ['/api/center/locations'],
  });
  
  // Initialize form with default values
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(insertLocationSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      description: '',
      openingHours: '',
      imageUrl: '',
      featuredOnHomepage: false,
      sortOrder: 0,
      tagline: 'Leading Eating Disorder Treatment'
    },
  });
  
  // Set form values when a location is selected for editing
  useEffect(() => {
    if (selectedLocation) {
      const formValues = {
        ...selectedLocation,
        // Ensure proper typing for optional fields
        email: selectedLocation.email || '',
        description: selectedLocation.description || '',
        openingHours: selectedLocation.openingHours || '',
        imageUrl: selectedLocation.imageUrl || '',
        tagline: selectedLocation.tagline || 'Leading Eating Disorder Treatment'
      };
      
      form.reset(formValues);
    }
  }, [selectedLocation, form]);
  
  // Handle opening the edit dialog
  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsEditDialogOpen(true);
  };
  
  // Handle opening the delete dialog
  const handleDeleteLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle confirming location deletion
  const confirmDeleteLocation = async () => {
    if (!selectedLocation) return;
    
    try {
      const response = await fetch(`/api/center/locations/${selectedLocation.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/center/locations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/center/locations/featured'] });
      
      toast({
        title: 'Location deleted',
        description: 'The location has been deleted successfully.',
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting location:', error);
      toast({
        title: 'Error',
        description: 'There was an error deleting the location. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return <div className="py-8 text-center">Loading locations data...</div>;
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locations Management</h1>
          <p className="text-muted-foreground">
            Manage treatment center locations
          </p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Location
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location) => (
          <div 
            key={location.id} 
            className="border rounded-lg overflow-hidden shadow-sm"
          >
            <div className="h-48 bg-gray-100 relative overflow-hidden">
              {location.imageUrl ? (
                <img 
                  src={location.imageUrl} 
                  alt={location.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No image available
                </div>
              )}
              
              {location.featuredOnHomepage && (
                <div className="absolute top-2 right-2 bg-teal-600 text-white text-xs px-2 py-1 rounded-full">
                  Featured
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-lg truncate">{location.name}</h3>
              <p className="text-teal-600 mb-2">{location.tagline}</p>
              
              <div className="space-y-2 my-3 text-sm">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p>{location.address}</p>
                    <p>{location.city}, {location.state} {location.zipCode}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <p>{location.phone}</p>
                </div>
                
                {location.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <p className="truncate">{location.email}</p>
                  </div>
                )}
                
                {location.openingHours && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <p className="truncate">{location.openingHours}</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditLocation(location)}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit Location
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-10 p-0 flex items-center justify-center"
                  onClick={() => handleDeleteLocation(location)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {locations.length === 0 && (
        <div className="text-center py-8 border rounded-lg mt-4">
          <p className="text-muted-foreground">No locations found. Add your first location to get started.</p>
        </div>
      )}
      
      {/* EDIT LOCATION DIALOG */}
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
              type="button" 
              onClick={() => {
                if (selectedLocation) {
                  const values = form.getValues();
                  console.log("Submitting edit for location", selectedLocation.id, values);
                  
                  fetch(`/api/center/locations/${selectedLocation.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                  })
                  .then(response => {
                    if (!response.ok) {
                      return response.text().then(text => {
                        throw new Error(text || response.statusText);
                      });
                    }
                    return response.json();
                  })
                  .then(updatedLocation => {
                    console.log("Location updated successfully:", updatedLocation);
                    
                    // Refresh data
                    queryClient.invalidateQueries({ queryKey: ['/api/center/locations'] });
                    queryClient.invalidateQueries({ queryKey: ['/api/center/locations/featured'] });
                    
                    toast({
                      title: 'Location updated',
                      description: 'The location has been updated successfully.',
                    });
                    
                    // Close dialog
                    setIsEditDialogOpen(false);
                  })
                  .catch(error => {
                    console.error('Error updating location:', error);
                    toast({
                      title: 'Error',
                      description: 'There was an error updating the location. Please try again.',
                      variant: 'destructive',
                    });
                  });
                }
              }}
              className="bg-teal-600 hover:bg-teal-700 mt-0"
            >
              Save Changes
            </Button>
          </div>
          
          <div className="border-t mt-4 pt-4">
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Complete Eating Care - [City]" {...field} />
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
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main Street" {...field} />
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <Input placeholder="Zip Code" {...field} />
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
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="location@example.com" {...field} value={field.value || ''} />
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
                          <Input placeholder="Monday-Friday: 8am-7pm" {...field} value={field.value || ''} />
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
                        <Input placeholder="Leading Eating Disorder Treatment" {...field} value={field.value || 'Leading Eating Disorder Treatment'} />
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
                          placeholder="Describe the location and its services" 
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
                      <FormLabel>Location Photo</FormLabel>
                      <FormControl>
                        <LocationImageUploadWithCrop 
                          currentImageUrl={field.value || null} 
                          onImageUploaded={(url) => {
                            field.onChange(url);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="featuredOnHomepage"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md border-teal-200 bg-teal-50/50">
                        <FormControl>
                          <Checkbox
                            checked={field.value === true}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Featured on Homepage</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Display this location in the featured locations section on the homepage
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
                            min="0" 
                            placeholder="0" 
                            {...field} 
                            value={field.value?.toString() || '0'} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* ADD LOCATION DIALOG */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Enter the details for the new treatment center location
            </DialogDescription>
          </DialogHeader>
          
          <SimpleAddLocationForm
            onSuccess={() => {
              setIsAddDialogOpen(false);
              toast({
                title: 'Location Added',
                description: 'The new location has been added successfully.'
              });
            }}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedLocation?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            
            <Button
              variant="destructive"
              onClick={confirmDeleteLocation}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}