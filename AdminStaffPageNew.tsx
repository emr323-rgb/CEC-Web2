import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StaffImageUploadWithCrop from "@/components/admin/StaffImageUploadWithCrop";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Staff, Location, insertStaffSchema } from "@shared/schema";
import { z } from "zod";
import { SimpleAddStaffForm } from "./SimpleAddStaffForm";

type StaffFormValues = z.infer<typeof insertStaffSchema>;

export default function AdminStaffPageNew() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  
  // Fetch staff data
  const { data: staff = [], isLoading: isStaffLoading } = useQuery<Staff[]>({ 
    queryKey: ['/api/center/staff'],
  });
  
  // Fetch locations data
  const { data: locations = [], isLoading: isLocationsLoading } = useQuery<Location[]>({ 
    queryKey: ['/api/center/locations'],
  });
  
  // Initialize form with default values
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(insertStaffSchema),
    defaultValues: {
      name: '',
      title: '',
      bio: null,
      email: null,
      phone: null,
      imageUrl: null,
      isLeadership: false,
      locationId: null,
      specialty: null,
      sortOrder: 0,
    },
  });
  
  // Set form values when a staff is selected for editing
  useEffect(() => {
    if (selectedStaff) {
      const formValues = {
        ...selectedStaff,
        // Ensure proper typing for optional fields
        bio: selectedStaff.bio || null,
        email: selectedStaff.email || null,
        phone: selectedStaff.phone || null,
        imageUrl: selectedStaff.imageUrl || null,
        specialty: selectedStaff.specialty || null,
      };
      
      form.reset(formValues);
    }
  }, [selectedStaff, form]);
  
  // Handle opening the edit dialog
  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsEditDialogOpen(true);
  };
  
  // Handle opening the delete dialog
  const handleDeleteStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle confirming staff deletion
  const confirmDeleteStaff = async () => {
    if (!selectedStaff) return;
    
    try {
      const response = await fetch(`/api/center/staff/${selectedStaff.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/center/staff'] });
      queryClient.invalidateQueries({ queryKey: ['/api/center/staff/leadership'] });
      
      toast({
        title: 'Staff member deleted',
        description: 'The staff member has been deleted successfully.',
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting staff member:', error);
      toast({
        title: 'Error',
        description: 'There was an error deleting the staff member. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  if (isStaffLoading || isLocationsLoading) {
    return <div className="py-8 text-center">Loading staff data...</div>;
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage staff members for all locations
          </p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Staff Member
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((member) => (
          <div 
            key={member.id} 
            className="border rounded-lg overflow-hidden shadow-sm"
          >
            <div className="h-48 bg-gray-100 relative overflow-hidden">
              {member.imageUrl ? (
                <img 
                  src={member.imageUrl} 
                  alt={member.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No image available
                </div>
              )}
              
              {member.isLeadership && (
                <div className="absolute top-2 right-2 bg-teal-600 text-white text-xs px-2 py-1 rounded-full">
                  Leadership
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-lg truncate">{member.name}</h3>
              <p className="text-teal-600 mb-2">{member.title}</p>
              
              {member.locationId && (
                <p className="text-sm text-muted-foreground mb-2">
                  Location: {
                    locations.find(loc => loc.id === member.locationId)?.name || 
                    'Unknown location'
                  }
                </p>
              )}
              
              <div className="text-sm line-clamp-2 min-h-[40px] mb-4">
                {member.bio || 'No biography available.'}
              </div>
              
              <div className="flex space-x-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditStaff(member)}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit Staff Member
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-10 p-0 flex items-center justify-center"
                  onClick={() => handleDeleteStaff(member)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {staff.length === 0 && (
        <div className="text-center py-8 border rounded-lg mt-4">
          <p className="text-muted-foreground">No staff members found. Add your first staff member to get started.</p>
        </div>
      )}
      
      {/* EDIT STAFF DIALOG */}
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
                  console.log("Submitting edit for staff", selectedStaff.id, values);
                  
                  // Handle leadership vs location
                  if (values.isLeadership) {
                    values.locationId = null;
                  }
                  
                  fetch(`/api/center/staff/${selectedStaff.id}`, {
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
                  .then(updatedStaff => {
                    console.log("Staff updated successfully:", updatedStaff);
                    
                    // Refresh data
                    queryClient.invalidateQueries({ queryKey: ['/api/center/staff'] });
                    queryClient.invalidateQueries({ queryKey: ['/api/center/staff/leadership'] });
                    
                    toast({
                      title: 'Staff member updated',
                      description: 'The staff member has been updated successfully.',
                    });
                    
                    // Close dialog
                    setIsEditDialogOpen(false);
                  })
                  .catch(error => {
                    console.error('Error updating staff member:', error);
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
              <form className="space-y-4">
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
                        <StaffImageUploadWithCrop 
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
                            field.onChange(checked);
                            
                            // Handle locationId relationship
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
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* ADD STAFF DIALOG */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Enter the details for the new staff member
            </DialogDescription>
          </DialogHeader>
          
          <SimpleAddStaffForm
            locations={locations}
            onSuccess={() => {
              setIsAddDialogOpen(false);
              toast({
                title: 'Staff Member Added',
                description: 'The new staff member has been added successfully.'
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
              Are you sure you want to delete {selectedStaff?.name}? This action cannot be undone.
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
              onClick={confirmDeleteStaff}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}