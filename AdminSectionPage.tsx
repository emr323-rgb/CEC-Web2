import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Redirect, Link } from 'wouter';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, MapPin, FileText, Video, Settings, Edit, Trash, ImageIcon, Home, Info, Stethoscope } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { EditDialog } from '@/components/ui/edit-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient, getQueryFn } from '@/lib/queryClient';

interface AdminSectionPageProps {
  title: string;
  section: 'locations' | 'staff' | 'content' | 'media' | 'settings';
}

// Define data types for each section
interface Location {
  id: number;
  name: string;
  address: string;
  status: string;
}

interface Staff {
  id: number;
  name: string;
  title: string; // This matches the database schema (was "role")
  locationId: number; // This matches the database schema (was "location" string)
  imageUrl?: string; // This matches the database schema (was "photo")
  email?: string;
  phone?: string;
  bio?: string;
  specialty?: string;
  isLeadership?: boolean;
  sortOrder?: number;
}

interface Content {
  id: number;
  key: string;
  section: string;
  value: string;
}

interface Media {
  id: number;
  name: string;
  type: string;
  size: string;
  uploaded: string;
  url?: string;
}

interface Setting {
  id: number;
  name: string;
  value: string;
}

// Define initial data
const initialData = {
  locations: [
    { id: 1, name: 'Complete Eating Care - Main Center', address: '123 Healing Way, New York, NY', status: 'Active' },
    { id: 2, name: 'Complete Eating Care - West Branch', address: '456 Recovery Blvd, Los Angeles, CA', status: 'Active' },
    { id: 3, name: 'Complete Eating Care - South Center', address: '789 Wellness Ave, Miami, FL', status: 'Active' }
  ],
  staff: [
    { id: 1, name: 'Dr. Amanda Torres', title: 'Medical Director', locationId: 1, imageUrl: 'https://randomuser.me/api/portraits/women/32.jpg', isLeadership: true },
    { id: 2, name: 'Dr. Michael Chen', title: 'Clinical Psychologist', locationId: 2, imageUrl: 'https://randomuser.me/api/portraits/men/45.jpg' },
    { id: 3, name: 'Sarah Johnson, RD', title: 'Lead Dietitian', locationId: 1, imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { id: 4, name: 'James Wilson, LCSW', title: 'Therapist', locationId: 3, imageUrl: 'https://randomuser.me/api/portraits/men/22.jpg' },
    { id: 5, name: 'Dr. Emily Rodriguez', title: 'Psychiatrist', locationId: 2, imageUrl: 'https://randomuser.me/api/portraits/women/17.jpg', isLeadership: true },
    { id: 6, name: 'Robert Smith, LMFT', title: 'Family Therapist', locationId: 3, imageUrl: 'https://randomuser.me/api/portraits/men/36.jpg' }
  ],
  content: [
    { id: 1, key: 'homepage_hero_title', section: 'Homepage', value: 'Compassionate Care for Eating Disorders' },
    { id: 2, key: 'homepage_hero_subtitle', section: 'Homepage', value: 'Evidence-based treatment in a supportive environment' },
    { id: 3, key: 'about_us_intro', section: 'About', value: 'Complete Eating Care is dedicated to providing comprehensive care...' },
    { id: 4, key: 'homepage_treatment_section_title', section: 'Homepage', value: 'Our Treatment Programs' },
    { id: 5, key: 'homepage_staff_section_title', section: 'Homepage', value: 'Our Expert Team' },
    { id: 6, key: 'homepage_locations_section_title', section: 'Homepage', value: 'Our Locations' }
  ],
  media: [
    { 
      id: 1, 
      name: 'Homepage Video', 
      type: 'Video', 
      size: '24.5 MB', 
      uploaded: '2023-05-01',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' 
    },
    { 
      id: 2, 
      name: 'Main Center Exterior', 
      type: 'Image', 
      size: '2.1 MB', 
      uploaded: '2023-04-15',
      url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1000' 
    },
    { 
      id: 3, 
      name: 'Staff Team Photo', 
      type: 'Image', 
      size: '3.4 MB', 
      uploaded: '2023-04-10',
      url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000' 
    }
  ],
  settings: [
    { id: 1, name: 'Site Title', value: 'Complete Eating Care' },
    { id: 2, name: 'Contact Email', value: 'info@completeeatingcare.com' },
    { id: 3, name: 'Contact Phone', value: '(800) 555-1234' }
  ]
};

export default function AdminSectionPage({ title, section }: AdminSectionPageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editItem, setEditItem] = useState<Location | Staff | Content | Media | Setting | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Use react-query to fetch data from the API
  const { data: locations = initialData.locations, refetch: refetchLocations } = useQuery<Location[]>({
    queryKey: ['/api/center/locations'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: staffMembers = initialData.staff, refetch: refetchStaff } = useQuery<Staff[]>({
    queryKey: ['/api/center/staff'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Create a map of location IDs to location names for easier reference
  const locationMap = React.useMemo(() => {
    const map: Record<number, string> = {};
    locations.forEach(location => {
      map[location.id] = location.name;
    });
    return map;
  }, [locations]);

  // Use state for these until we have actual API endpoints for them
  const [contentItems, setContentItems] = useState<Content[]>(initialData.content);
  const [mediaItems, setMediaItems] = useState<Media[]>(initialData.media);
  const [settingItems, setSettingItems] = useState<Setting[]>(initialData.settings);
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  // Handle edit button click
  const handleEditClick = (item: Location | Staff | Content | Media | Setting) => {
    setEditItem(item);
    setIsEditDialogOpen(true);
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditItem(null);
  };
  
  // Set up mutations for each resource type
  const updateStaffMutation = useMutation({
    mutationFn: async (data: Partial<Staff>) => {
      const res = await apiRequest('PATCH', `/api/center/staff/${data.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/center/staff'] });
      queryClient.invalidateQueries({ queryKey: ['/api/center/staff/leadership'] });
      toast({
        title: 'Success',
        description: 'Staff member updated successfully.',
      });
      handleDialogClose();
    },
    onError: (error: Error) => {
      console.error('Error updating staff:', error);
      toast({
        title: 'Error',
        description: `Failed to update staff member: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: async (data: Partial<Location>) => {
      const res = await apiRequest('PATCH', `/api/center/locations/${data.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/center/locations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/center/locations/featured'] });
      toast({
        title: 'Success',
        description: 'Location updated successfully.',
      });
      handleDialogClose();
    },
    onError: (error: Error) => {
      console.error('Error updating location:', error);
      toast({
        title: 'Error',
        description: `Failed to update location: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle saving edited item
  const handleSaveItem = async (data: Record<string, any>) => {
    try {
      // Use the appropriate mutation based on section
      if (section === 'locations') {
        await updateLocationMutation.mutateAsync(data as Partial<Location>);
      } else if (section === 'staff') {
        // Ensure proper type conversions
        if (typeof data.isLeadership === 'string') {
          data.isLeadership = data.isLeadership === 'true';
        }
        if (typeof data.locationId === 'string') {
          data.locationId = parseInt(data.locationId, 10);
        }
        await updateStaffMutation.mutateAsync(data as Partial<Staff>);
      } else if (section === 'content') {
        // Still using mock updates for content until we implement the API
        setContentItems(prev => 
          prev.map(item => item.id === data.id ? { ...data } as Content : item)
        );
        toast({
          title: 'Success',
          description: 'Content item updated successfully.',
        });
        handleDialogClose();
      } else if (section === 'media') {
        // Still using mock updates for media until we implement the API
        setMediaItems(prev => 
          prev.map(item => item.id === data.id ? { ...data } as Media : item)
        );
        toast({
          title: 'Success',
          description: 'Media item updated successfully.',
        });
        handleDialogClose();
      } else if (section === 'settings') {
        // Still using mock updates for settings until we implement the API
        setSettingItems(prev => 
          prev.map(item => item.id === data.id ? { ...data } as Setting : item)
        );
        toast({
          title: 'Success',
          description: 'Setting updated successfully.',
        });
        handleDialogClose();
      }
    } catch (error) {
      console.error('Error saving item:', error);
      // Error handling is now in the mutation callbacks
    }
  };

  // Function to render the appropriate icon based on section
  const getSectionIcon = () => {
    switch (section) {
      case 'locations':
        return <MapPin className="h-5 w-5" />;
      case 'staff':
        return <Users className="h-5 w-5" />;
      case 'content':
        return <FileText className="h-5 w-5" />;
      case 'media':
        return <Video className="h-5 w-5" />;
      case 'settings':
        return <Settings className="h-5 w-5" />;
      default:
        return null;
    }
  };

  // Function to get description based on section
  const getSectionDescription = () => {
    switch (section) {
      case 'locations':
        return 'Manage treatment center locations';
      case 'staff':
        return 'Manage clinical staff and team members';
      case 'content':
        return 'Edit website content and sections';
      case 'media':
        return 'Upload and manage videos and images';
      case 'settings':
        return 'Configure admin preferences';
      default:
        return '';
    }
  };
  
  // Function to get a more descriptive location for content items
  const getDisplayLocationForContent = (item: Content) => {
    // Create readable content location descriptions based on key and section
    if (item.section === 'Homepage') {
      if (item.key.includes('hero')) {
        return 'Homepage Hero Section';
      } else if (item.key.includes('treatment')) {
        return 'Homepage Treatments Section';
      } else if (item.key.includes('staff') || item.key.includes('team')) {
        return 'Homepage Team Section';
      } else if (item.key.includes('location')) {
        return 'Homepage Locations Section';
      } else if (item.key.includes('cta')) {
        return 'Homepage Call to Action';
      }
      return 'Homepage Content';
    } else if (item.section === 'About') {
      if (item.key.includes('intro')) {
        return 'About Us Introduction';
      } else if (item.key.includes('mission')) {
        return 'Our Mission Statement';
      } else if (item.key.includes('value')) {
        return 'Our Values Section';
      }
      return 'About Us Page';
    } else if (item.section === 'Treatments') {
      return 'Treatments Page';
    } else if (item.section === 'Locations') {
      return 'Locations Page';
    }
    
    return item.section + ' Section';
  };



  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {getSectionIcon()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#005a8e]">{title}</h1>
              <p className="text-gray-500">{getSectionDescription()}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {section === 'content' && (
              <Link href="/admin/homepage-hero-video">
                <Button 
                  variant="default" 
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Video size={16} />
                  Manage Hero Video
                </Button>
              </Link>
            )}
            
            {section !== 'settings' && (
              <Button className="gap-2">
                <Plus size={16} />
                {section === 'locations' && 'Add Location'}
                {section === 'staff' && 'Add Staff Member'}
                {section === 'content' && 'Add Content'}
                {section === 'media' && 'Upload Media'}
              </Button>
            )}
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {section === 'locations' && 'Locations Directory'}
              {section === 'staff' && 'Staff Directory'}
              {section === 'content' && 'Content Items'}
              {section === 'media' && 'Media Library'}
              {section === 'settings' && 'System Settings'}
            </CardTitle>
            <CardDescription>
              {section === 'locations' && 'View and manage all treatment locations'}
              {section === 'staff' && 'View and manage all staff members'}
              {section === 'content' && 'Edit website content elements'}
              {section === 'media' && 'Manage uploaded media files'}
              {section === 'settings' && 'Configure system-wide settings'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    {section === 'locations' && (
                      <>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Name</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Address</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                      </>
                    )}
                    
                    {section === 'staff' && (
                      <>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Photo</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Name</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Title</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Location</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                      </>
                    )}
                    
                    {section === 'content' && (
                      <>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Content ID</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Location on Website</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Content Text</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                      </>
                    )}
                    
                    {section === 'media' && (
                      <>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Preview</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Name</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Type</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Size</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Uploaded</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                      </>
                    )}
                    
                    {section === 'settings' && (
                      <>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Setting</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Value</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {section === 'locations' && locations.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-sm">{item.address}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(item)} className="flex items-center gap-1">
                            <Edit size={14} />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {section === 'staff' && staffMembers.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        {item.imageUrl ? (
                          <div className="h-10 w-10 rounded-full overflow-hidden">
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users size={16} className="text-gray-500" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-sm">{item.title}</td>
                      <td className="px-4 py-3 text-sm">
                        {locationMap[item.locationId] || `Unknown (ID: ${item.locationId})`}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(item)} className="flex items-center gap-1">
                            <Edit size={14} />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {section === 'content' && contentItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-xs">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                          {item.key.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          {item.section === 'Homepage' && <Home size={14} className="mr-1 text-blue-500" />}
                          {item.section === 'About' && <Info size={14} className="mr-1 text-purple-500" />}
                          {item.section === 'Treatments' && <Stethoscope size={14} className="mr-1 text-green-500" />}
                          {item.section === 'Locations' && <MapPin size={14} className="mr-1 text-red-500" />}
                          <span className="font-medium">{getDisplayLocationForContent(item)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm truncate max-w-[300px]">
                        {item.value.length > 100 
                          ? item.value.substring(0, 100) + '...' 
                          : item.value}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(item)} className="flex items-center gap-1">
                            <Edit size={14} />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {section === 'media' && mediaItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        {item.url ? (
                          item.type === 'Image' ? (
                            <div className="h-14 w-20 rounded-md overflow-hidden">
                              <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                            </div>
                          ) : (
                            <div className="h-14 w-20 rounded-md bg-gray-100 flex items-center justify-center">
                              <Video className="h-6 w-6 text-primary" />
                            </div>
                          )
                        ) : (
                          <div className="h-14 w-20 rounded-md bg-gray-100 flex items-center justify-center">
                            {item.type === 'Image' ? (
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            ) : (
                              <Video className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.type === 'Image' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{item.size}</td>
                      <td className="px-4 py-3 text-sm">{item.uploaded}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(item)} className="flex items-center gap-1">
                            <Edit size={14} />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {section === 'settings' && settingItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-sm">{item.value}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(item)} className="flex items-center gap-1">
                            <Edit size={14} />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Dialog */}
      {editItem && isEditDialogOpen && section === 'locations' && (
        <EditDialog
          title="Edit Location"
          description="Update this location's details"
          isOpen={isEditDialogOpen}
          onClose={handleDialogClose}
          onSave={handleSaveItem}
          initialData={editItem}
          fields={[
            { name: 'name', label: 'Location Name', type: 'text' },
            { name: 'address', label: 'Address', type: 'text' },
            { name: 'status', label: 'Status', type: 'select', options: [
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ] }
          ]}
        />
      )}
      
      {editItem && isEditDialogOpen && section === 'staff' && (
        <EditDialog
          title="Edit Staff Member"
          description="Update this staff member's details"
          isOpen={isEditDialogOpen}
          onClose={handleDialogClose}
          onSave={handleSaveItem}
          initialData={editItem}
          fields={[
            { name: 'name', label: 'Full Name', type: 'text' },
            { name: 'title', label: 'Title', type: 'text' },
            { name: 'locationId', label: 'Location', type: 'select', options: 
              locations.map(location => ({
                value: String(location.id),
                label: location.name
              }))
            },
            { 
              name: 'imageUrl', 
              label: 'Staff Photo', 
              type: 'file-upload', 
              uploadType: 'image',
              placeholder: 'Enter photo URL or upload an image' 
            },
            { name: 'isLeadership', label: 'Leadership Team', type: 'select', options: [
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ] }
          ]}
        />
      )}
      
      {editItem && isEditDialogOpen && section === 'content' && (
        <EditDialog
          title="Edit Content Item"
          description="Update this content element"
          isOpen={isEditDialogOpen}
          onClose={handleDialogClose}
          onSave={handleSaveItem}
          initialData={editItem}
          fields={[
            { name: 'key', label: 'Content Key', type: 'text' },
            { name: 'section', label: 'Section', type: 'select', options: [
              { value: 'Homepage', label: 'Homepage' },
              { value: 'About', label: 'About' },
              { value: 'Treatments', label: 'Treatments' },
              { value: 'Locations', label: 'Locations' },
            ] },
            { name: 'value', label: 'Content Value', type: 'textarea' }
          ]}
        />
      )}
      
      {editItem && isEditDialogOpen && section === 'media' && (
        <EditDialog
          title="Edit Media Item"
          description="Update media details"
          isOpen={isEditDialogOpen}
          onClose={handleDialogClose}
          onSave={handleSaveItem}
          initialData={editItem}
          fields={[
            { name: 'name', label: 'Media Name', type: 'text' },
            { name: 'type', label: 'Type', type: 'select', options: [
              { value: 'Video', label: 'Video' },
              { value: 'Image', label: 'Image' },
            ] },
            { 
              name: 'url', 
              label: 'Media File', 
              type: 'file-upload', 
              uploadType: (editItem as Media).type === 'Video' ? 'video' : 'image',
              placeholder: `Enter ${(editItem as Media).type.toLowerCase()} URL or upload a file` 
            }
          ]}
        />
      )}
      
      {editItem && isEditDialogOpen && section === 'settings' && (
        <EditDialog
          title="Edit Setting"
          description="Update system setting"
          isOpen={isEditDialogOpen}
          onClose={handleDialogClose}
          onSave={handleSaveItem}
          initialData={editItem}
          fields={[
            { name: 'name', label: 'Setting Name', type: 'text' },
            { name: 'value', label: 'Value', type: 'text' }
          ]}
        />
      )}
    </AdminLayout>
  );
}