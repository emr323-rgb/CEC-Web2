import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Staff, Location } from '@shared/schema';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

// Form validation schema for staff data
const staffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  title: z.string().min(2, 'Title is required'),
  bio: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().email('Valid email is required').nullable(),
  isLeadership: z.boolean().default(false),
  locationId: z.number().nullable(),
  specialty: z.string().nullable(),
  imageUrl: z.string().nullable(),
  sortOrder: z.number().nullable()
});

type StaffFormValues = z.infer<typeof staffSchema>;

export default function EditStaffPage() {
  const [match, params] = useRoute<{ id: string }>('/admin/staff/edit/:id');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch staff member to edit
  const { data: staffMember, isLoading: isStaffLoading } = useQuery<Staff>({
    queryKey: [`/api/center/staff/${params?.id}`],
    enabled: !!params?.id,
  });

  // Fetch all locations for the location dropdown
  const { data: locations, isLoading: isLocationsLoading } = useQuery<Location[]>({
    queryKey: ['/api/center/locations'],
  });

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: '',
      title: '',
      bio: null,
      phone: null,
      email: null,
      isLeadership: false,
      locationId: null,
      specialty: null,
      imageUrl: null,
      sortOrder: 0
    }
  });

  // Update form with staff data when it's loaded
  useEffect(() => {
    if (staffMember) {
      form.reset({
        name: staffMember.name,
        title: staffMember.title,
        bio: staffMember.bio,
        phone: staffMember.phone,
        email: staffMember.email,
        isLeadership: !!staffMember.isLeadership,
        locationId: staffMember.locationId,
        specialty: staffMember.specialty,
        imageUrl: staffMember.imageUrl,
        sortOrder: staffMember.sortOrder || 0
      });
    }
  }, [staffMember, form]);

  const onSubmit = async (values: StaffFormValues) => {
    if (!params?.id) return;
    
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/center/staff/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include'
      });
      
      console.log(`PATCH response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }
      
      const updatedStaff = await response.json();
      console.log("Staff updated successfully:", updatedStaff);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/center/staff'] });
      queryClient.invalidateQueries({ queryKey: ['/api/center/staff/leadership'] });
      queryClient.invalidateQueries({ queryKey: [`/api/center/staff/${params.id}`] });
      
      toast({
        title: 'Staff member updated',
        description: 'The staff member has been updated successfully.',
      });
      
      // Navigate back to staff list
      navigate('/admin/staff');
    } catch (error) {
      console.error('Error updating staff member:', error);
      toast({
        title: 'Error',
        description: 'There was an error updating the staff member. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isStaffLoading || isLocationsLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center mb-8">
          <Button variant="outline" className="mr-4">
            <Link href="/admin/staff">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Staff List
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-teal-800">Edit Staff Member</h1>
        </div>
        <Card className="p-6">
          <CardContent className="p-8 flex justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-t-transparent border-teal-600" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!staffMember) {
    return (
      <div className="container py-10">
        <div className="flex items-center mb-8">
          <Button variant="outline" className="mr-4">
            <Link href="/admin/staff">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Staff List
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-teal-800">Edit Staff Member</h1>
        </div>
        <Card className="p-6">
          <CardContent className="p-8">
            <p className="text-center">Staff member not found. <Link href="/admin/staff" className="text-teal-600 underline">Return to staff list</Link></p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center mb-8">
        <Button variant="outline" className="mr-4">
          <Link href="/admin/staff">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Staff List
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-teal-800">Edit Staff Member: {staffMember.name}</h1>
      </div>

      <Card className="p-6">
        <CardContent className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
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
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialty</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
              </div>
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biography</FormLabel>
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
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="isLeadership"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Leadership Team</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Mark this staff member as part of the leadership team
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
                  onClick={() => navigate('/admin/staff')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-teal-600 hover:bg-teal-700"
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
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}