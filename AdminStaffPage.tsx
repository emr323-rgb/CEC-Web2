import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Staff, Location } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Phone, Mail, Building, Award } from 'lucide-react';
import { Link } from 'wouter';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import StaffImageUpload from '@/components/admin/StaffImageUpload';

// Form validation schema for staff data
const staffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  title: z.string().min(2, 'Title is required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').nullable(),
  phone: z.string().nullable(),
  email: z.string().email('Valid email is required').nullable(),
  isLeadership: z.boolean().default(false),
  locationId: z.coerce.number().nullable().optional(),
  specialty: z.string().nullable(),
  imageUrl: z.string().nullable(),
  sortOrder: z.number().nullable()
});

type StaffFormValues = z.infer<typeof staffSchema>;

export default function AdminStaffPage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const { toast } = useToast();

  // Fetch all staff
  const { data: staffMembers, isLoading } = useQuery<Staff[]>({
    queryKey: ['/api/center/staff'],
  });

  // Fetch all locations for the location dropdown
  const { data: locations } = useQuery<Location[]>({
    queryKey: ['/api/center/locations'],
  });

  // Get a default locationId from the list of locations (if available)
  const getDefaultLocationId = useCallback(() => {
    return locations && locations.length > 0 ? locations[0].id : null;
  }, [locations]);

  // Default values for the forms
  const defaultValues: Partial<StaffFormValues> = {
    name: '',
    title: '',
    bio: null,
    phone: null,
    email: null,
    isLeadership: false,
    locationId: getDefaultLocationId(),
    specialty: null,
    imageUrl: null,
    sortOrder: 0
  };

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues,
  });
  
  // Watch isLeadership for edit form
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'isLeadership' && value.isLeadership) {
        // If leadership is checked, clear locationId
        form.setValue('locationId', null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const addForm = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues,
  });
  
  // Watch isLeadership and update locationId accordingly for add form
  React.useEffect(() => {
    // Watch specifically for the isLeadership field
    const subscription = addForm.watch((value, { name }) => {
      console.log("Add form field changed:", name, value);
      if (name === 'isLeadership') {
        console.log("Leadership field changed to:", value.isLeadership);
        if (value.isLeadership) {
          // If leadership is checked, clear locationId
          console.log("Setting locationId to null because leadership is checked");
          addForm.setValue('locationId', null);
        } else {
          // If leadership is unchecked, set default locationId
          const defaultId = getDefaultLocationId();
          console.log(`Setting default locationId to ${defaultId}`);
          addForm.setValue('locationId', defaultId);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [addForm, getDefaultLocationId]);
  
  // Same watcher for the edit form
  React.useEffect(() => {
    // Watch specifically for the isLeadership field
    const subscription = form.watch((value, { name }) => {
      console.log("Edit form field changed:", name, value);
      if (name === 'isLeadership') {
        console.log("Edit: Leadership field changed to:", value.isLeadership);
        if (value.isLeadership) {
          // If leadership is checked, clear locationId
          console.log("Edit: Setting locationId to null because leadership is checked");
          form.setValue('locationId', null);
        } else {
          // If leadership is unchecked, set default locationId
          const defaultId = getDefaultLocationId();
          console.log(`Edit: Setting default locationId to ${defaultId}`);
          form.setValue('locationId', defaultId);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, getDefaultLocationId]);
  
  // Update form defaults when locations change
  React.useEffect(() => {
    // Only set default locationId if leadership is not checked
    if (!addForm.getValues('isLeadership')) {
      const defaultId = getDefaultLocationId();
      if (defaultId !== addForm.getValues('locationId')) {
        addForm.setValue('locationId', defaultId);
      }
    }
  }, [locations, addForm, getDefaultLocationId]);

  // Function to handle opening the edit dialog
  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    form.reset({
      name: staff.name,
      title: staff.title,
      bio: staff.bio,
      phone: staff.phone,
      email: staff.email,
      isLeadership: staff.isLeadership === true, // Convert nullable boolean to boolean
      locationId: staff.locationId,
      specialty: staff.specialty,
      imageUrl: staff.imageUrl,
      sortOrder: staff.sortOrder || 0
    });
    setIsEditDialogOpen(true);
  };

  // Handle form submission for editing a staff member
  const onSubmit = async (values: StaffFormValues) => {
    if (!selectedStaff) return;
    
    try {
      // If staff is leadership, set locationId to null
      if (values.isLeadership) {
        values.locationId = null;
        console.log("Edit form: Setting locationId to null for leadership staff");
      } 
      // If staff is not leadership and locationId is null/undefined, try to use default value
      else if (!values.locationId) {
        // For non-leadership staff, a location is required
        if (locations && locations.length > 0) {
          values.locationId = locations[0].id;
          console.log(`Edit form: Setting default locationId to ${locations[0].id}`);
        } else {
          console.error("Edit form: Non-leadership staff requires a location, but no locations are available");
          toast({
            title: 'Location Required',
            description: 'Regular staff members must be assigned to a location. Please select a location or mark as a leadership team member.',
            variant: 'destructive',
          });
          return; // Prevent submission
        }
      }
      
      const url = `/api/center/staff/${selectedStaff.id}`;
      console.log(`Submitting update with method PATCH to ${url}`, values);
      
      // Use apiRequest instead of raw fetch
      const response = await apiRequest('PATCH', url, values);
      
      console.log(`PATCH response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error updating staff:", errorText);
        throw new Error(errorText || response.statusText);
      }
      
      const updatedStaff = await response.json();
      console.log("Staff updated successfully:", updatedStaff);
      
      queryClient.invalidateQueries({ queryKey: ['/api/center/staff'] });
      queryClient.invalidateQueries({ queryKey: ['/api/center/staff/leadership'] });
      
      toast({
        title: 'Staff member updated',
        description: 'The staff member has been updated successfully.',
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating staff member:', error);
      toast({
        title: 'Error',
        description: 'There was an error updating the staff member. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle form submission for adding a new staff member
  const onAddSubmit = async (values: StaffFormValues) => {
    console.log("onAddSubmit called with values:", values);
    
    try {
      // Check if the form is valid
      const formErrors = addForm.formState.errors;
      if (Object.keys(formErrors).length > 0) {
        console.log("Form has validation errors:", formErrors);
        
        // Show toast with validation errors
        toast({
          title: 'Validation Error',
          description: 'Please fix the form errors before submitting.',
          variant: 'destructive',
        });
        return;
      }
      
      // If staff is leadership, set locationId to null
      if (values.isLeadership) {
        values.locationId = null;
        console.log("Setting locationId to null for leadership staff");
      } 
      // If staff is not leadership and locationId is null/undefined, try to use default value
      else if (!values.locationId) {
        // For non-leadership staff, a location is required
        if (locations && locations.length > 0) {
          values.locationId = locations[0].id;
          console.log(`Setting default locationId to ${locations[0].id}`);
        } else {
          console.error("Non-leadership staff requires a location, but no locations are available");
          toast({
            title: 'Location Required',
            description: 'Regular staff members must be assigned to a location. Please select a location or mark as a leadership team member.',
            variant: 'destructive',
          });
          return; // Prevent submission
        }
      }
      
      console.log("Submitting staff data:", values);
      
      // Use apiRequest instead of raw fetch
      const response = await apiRequest('POST', '/api/center/staff', values);
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(errorText || response.statusText);
      }
      
      const result = await response.json();
      console.log("Staff created successfully:", result);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/center/staff'] });
      queryClient.invalidateQueries({ queryKey: ['/api/center/staff/leadership'] });
      
      toast({
        title: 'Staff member added',
        description: 'The new staff member has been added successfully.',
      });
      
      // Reset form with fresh values and close dialog
      const freshValues = {
        ...defaultValues,
        locationId: getDefaultLocationId()
      };
      console.log("Resetting form with fresh values:", freshValues);
      addForm.reset(freshValues);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding staff member:', error);
      toast({
        title: 'Error',
        description: 'There was an error adding the staff member. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Function to get the location name by ID
  const getLocationName = (locationId?: number) => {
    if (!locationId || !locations) return 'No location assigned';
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.name : 'Unknown location';
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-teal-800">Leadership</h1>
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Link href="/admin">Return to Dashboard</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-64 bg-gray-200 animate-pulse"></div>
              <CardContent className="p-6">
                <div className="h-7 bg-gray-200 animate-pulse mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-200 animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 animate-pulse mb-2 w-5/6"></div>
                <div className="h-4 bg-gray-200 animate-pulse mb-4 w-2/3"></div>
                <div className="h-10 bg-gray-200 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-teal-800">Leadership (Admin View)</h1>
        <div className="flex gap-4">
          <Button 
            className="bg-green-600 hover:bg-green-700" 
            onClick={() => {
              console.log("Add Staff button clicked");
              // Reset form with fresh values including default locationId
              const freshValues = {
                ...defaultValues,
                locationId: getDefaultLocationId()
              };
              console.log("Resetting form with values:", freshValues);
              addForm.reset(freshValues);
              setIsAddDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Staff Member
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Link href="/admin">Return to Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {staffMembers?.map((staff) => (
          <Card key={staff.id} className="overflow-hidden shadow-md relative group">
            {staff.imageUrl ? (
              <div 
                className="h-64 bg-cover bg-center" 
                style={{ backgroundImage: `url(${staff.imageUrl})` }}
              />
            ) : (
              <div className="h-64 bg-teal-100 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-teal-200 flex items-center justify-center">
                  <span className="text-3xl text-teal-700 font-bold">
                    {staff.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
            )}
            
            {/* Edit button - visible on hover */}
            <Button 
              className="absolute top-2 right-2 bg-white text-teal-700 hover:bg-teal-50 opacity-0 group-hover:opacity-100 transition-opacity"
              size="icon"
              variant="outline"
              onClick={() => handleEditStaff(staff)}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-1 text-teal-800">{staff.name}</h3>
              <p className="text-teal-600 mb-2">{staff.title}</p>
              <p className="text-gray-700 mb-4 line-clamp-3">{staff.bio || ''}</p>
              
              {staff.specialty && (
                <p className="text-gray-600 mb-2 text-sm">
                  <span className="font-medium">Specialty:</span> {staff.specialty}
                </p>
              )}
              
              {staff.locationId && (
                <p className="text-gray-600 mb-2 flex items-center text-sm">
                  <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{getLocationName(staff.locationId)}</span>
                </p>
              )}
              
              {staff.email && (
                <p className="text-gray-600 mb-2 flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{staff.email}</span>
                </p>
              )}
              
              {staff.phone && (
                <p className="text-gray-600 mb-2 flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{staff.phone}</span>
                </p>
              )}
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full border-teal-600 text-teal-600 hover:bg-teal-50"
                >
                  <Link href={`/admin/staff/edit/${staff.id}`}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit Staff Member
                  </Link>
                </Button>
              </div>
              
              {staff.isLeadership && (
                <div className="mt-4 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium inline-flex items-center rounded">
                  <Award className="h-3 w-3 mr-1" /> Leadership Team
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start">
            <DialogHeader className="p-0">
              <DialogTitle>Edit Staff Member</DialogTitle>
              <DialogDescription>
                Update the details for {selectedStaff?.name}
              </DialogDescription>
            </DialogHeader>
            
            <Button 
              type="button" 
              onClick={() => {
                if (selectedStaff) {
                  const values = form.getValues();
                  console.log("Manually submitting PATCH for staff", selectedStaff.id, values);
                  
                  fetch(`/api/center/staff/${selectedStaff.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                    credentials: 'include'
                  })
                  .then(response => {
                    console.log("PATCH response status:", response.status);
                    if (response.ok) {
                      return response.json();
                    }
                    throw new Error(`Error: ${response.status}`);
                  })
                  .then(data => {
                    console.log("Update successful:", data);
                    queryClient.invalidateQueries({ queryKey: ['/api/center/staff'] });
                    queryClient.invalidateQueries({ queryKey: ['/api/center/staff/leadership'] });
                    
                    toast({
                      title: 'Staff member updated',
                      description: 'The staff member has been updated successfully.',
                    });
                    
                    setIsEditDialogOpen(false);
                  })
                  .catch(error => {
                    console.error("Error updating staff:", error);
                    toast({
                      title: 'Error',
                      description: 'There was an error updating the staff member. Please try again.',
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
              <form id="editStaffForm" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Job title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Second column intentionally left empty for layout */}
                <div></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} value={field.value || ''} />
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
                        <Input placeholder="(555) 123-4567" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty</FormLabel>
                    <FormControl>
                      <Input placeholder="Eating disorders, anxiety, depression, etc." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Only show location field if not leadership */}
              {!form.watch("isLeadership") && (
                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "0" ? null : Number(value))}
                        value={field.value?.toString() || "0"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">No location</SelectItem>
                          {locations?.map((location) => (
                            <SelectItem key={location.id} value={location.id.toString()}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biography</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Professional biography" 
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
                    <FormLabel>Staff Photo</FormLabel>
                    <FormControl>
                      <StaffImageUpload 
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
              
              <FormField
                control={form.control}
                name="isLeadership"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md border-teal-200 bg-teal-50/50">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={(checked) => {
                          console.log("Edit form: Leadership checkbox changed to:", checked);
                          field.onChange(checked);
                          
                          // This direct change complements the watcher and ensures immediate UI updates
                          if (checked === true) {
                            form.setValue('locationId', null);
                          } else if (locations && locations.length > 0) {
                            form.setValue('locationId', locations[0].id);
                          }
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Leadership Team Member</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Mark this staff member as part of the organization-wide leadership team (no location assignment)
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              {/* No footer button needed as it's at the top */}
            </form>
          </Form>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add Staff Dialog with Simple Form */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Enter the details for the new staff member
            </DialogDescription>
          </DialogHeader>
          
          {/* Import the simple form component here */}
          <div className="pt-4">
            {/* This is a completely separate form component for adding staff */}
            {/* @ts-ignore */}
            <SimpleAddStaffForm
              locations={locations}
              onSuccess={() => {
                setIsAddDialogOpen(false);
                
                toast({
                  title: 'Staff member added',
                  description: 'The new staff member has been added successfully.'
                });
                
                // Refresh data
                queryClient.invalidateQueries({ queryKey: ['/api/center/staff'] });
                queryClient.invalidateQueries({ queryKey: ['/api/center/staff/leadership'] });
              }}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}