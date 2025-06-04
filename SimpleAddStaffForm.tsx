import React, { useState } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import StaffImageUploadWithCrop from "@/components/admin/StaffImageUploadWithCrop";
import { Location } from "@shared/schema";

interface SimpleAddStaffFormProps {
  locations: Location[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function SimpleAddStaffForm({ locations, onSuccess, onCancel }: SimpleAddStaffFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    specialty: '',
    imageUrl: '',
    isLeadership: false,
    locationId: locations.length > 0 ? locations[0].id : null,
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    // Update the leadership status
    setFormData(prev => ({ 
      ...prev, 
      [name]: checked,
      // If leadership is checked, clear locationId
      locationId: checked ? null : (locations.length > 0 ? locations[0].id : null)
    }));
  };
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      locationId: value === "0" ? null : parseInt(value)
    }));
  };
  
  const handleImageUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!formData.name || !formData.title) {
        toast({
          title: 'Missing Information',
          description: 'Name and title are required fields.',
          variant: 'destructive',
        });
        return;
      }
      
      // Convert form data to match API expectations
      const staffData = {
        name: formData.name,
        title: formData.title,
        bio: formData.bio || null,
        email: formData.email || null,
        phone: formData.phone || null,
        imageUrl: formData.imageUrl || null,
        specialty: formData.specialty || null,
        isLeadership: formData.isLeadership,
        locationId: formData.isLeadership ? null : formData.locationId,
        sortOrder: 0
      };
      
      console.log("Submitting new staff data:", staffData);
      
      // Send the API request
      const response = await fetch('/api/center/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffData),
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || response.statusText);
      }
      
      const result = await response.json();
      console.log("Staff added successfully:", result);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/center/staff'] });
      queryClient.invalidateQueries({ queryKey: ['/api/center/staff/leadership'] });
      
      toast({
        title: 'Success',
        description: 'Staff member added successfully!',
      });
      
      // Call success callback
      onSuccess();
    } catch (error) {
      console.error("Error adding staff:", error);
      toast({
        title: 'Error',
        description: 'Failed to add staff member. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Full name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Job title"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Email address"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium">
            Phone
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Phone number"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="specialty" className="block text-sm font-medium">
          Specialty
        </label>
        <input
          type="text"
          id="specialty"
          name="specialty"
          value={formData.specialty}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Area of expertise"
        />
      </div>
      
      <div className="flex items-center space-x-2 p-4 border rounded-md border-teal-200 bg-teal-50/50">
        <input
          type="checkbox"
          id="isLeadership"
          name="isLeadership"
          checked={formData.isLeadership}
          onChange={handleCheckboxChange}
          className="h-4 w-4"
        />
        <label htmlFor="isLeadership" className="text-sm font-medium">
          Leadership Team Member (no location assignment)
        </label>
      </div>
      
      {!formData.isLeadership && locations.length > 0 && (
        <div className="space-y-2">
          <label htmlFor="locationId" className="block text-sm font-medium">
            Location
          </label>
          <select
            id="locationId"
            name="locationId"
            value={formData.locationId?.toString() || "0"}
            onChange={handleLocationChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {locations.map(location => (
              <option key={location.id} value={location.id.toString()}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="bio" className="block text-sm font-medium">
          Biography
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[120px]"
          placeholder="Professional biography"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Staff Photo</label>
        <StaffImageUploadWithCrop
          currentImageUrl={formData.imageUrl || null}
          onImageUploaded={handleImageUploaded}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Staff Member"}
        </Button>
      </div>
    </form>
  );
}