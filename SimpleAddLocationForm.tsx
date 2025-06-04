import React, { useState } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import LocationImageUploadWithCrop from "@/components/admin/LocationImageUploadWithCrop";

interface SimpleAddLocationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function SimpleAddLocationForm({ onSuccess, onCancel }: SimpleAddLocationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
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
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleImageUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.zipCode || !formData.phone) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all required fields (name, address, city, state, zip code, and phone).',
          variant: 'destructive',
        });
        return;
      }
      
      // Send the API request
      const response = await fetch('/api/center/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || response.statusText);
      }
      
      const result = await response.json();
      console.log("Location added successfully:", result);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/center/locations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/center/locations/featured'] });
      
      toast({
        title: 'Success',
        description: 'Location added successfully!',
      });
      
      // Call success callback
      onSuccess();
    } catch (error) {
      console.error("Error adding location:", error);
      toast({
        title: 'Error',
        description: 'Failed to add location. Please try again.',
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
          Location Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Complete Eating Care - [City]"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="address" className="block text-sm font-medium">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="123 Main Street"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="city" className="block text-sm font-medium">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="New York"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="state" className="block text-sm font-medium">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="NY"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="zipCode" className="block text-sm font-medium">
            Zip Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="10001"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="(555) 123-4567"
            required
          />
        </div>
      </div>
      
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
          placeholder="location@completeeatingcare.com"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="openingHours" className="block text-sm font-medium">
          Opening Hours
        </label>
        <input
          type="text"
          id="openingHours"
          name="openingHours"
          value={formData.openingHours}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Monday-Friday: 8am-7pm, Saturday: 10am-2pm"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="tagline" className="block text-sm font-medium">
          Tagline
        </label>
        <input
          type="text"
          id="tagline"
          name="tagline"
          value={formData.tagline}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Leading Eating Disorder Treatment"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[120px]"
          placeholder="Describe the location and its services"
        />
      </div>
      
      <div className="flex items-center space-x-2 p-4 border rounded-md border-teal-200 bg-teal-50/50">
        <input
          type="checkbox"
          id="featuredOnHomepage"
          name="featuredOnHomepage"
          checked={formData.featuredOnHomepage}
          onChange={handleCheckboxChange}
          className="h-4 w-4"
        />
        <label htmlFor="featuredOnHomepage" className="text-sm font-medium">
          Feature this location on the homepage
        </label>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="sortOrder" className="block text-sm font-medium">
          Sort Order
        </label>
        <input
          type="number"
          id="sortOrder"
          name="sortOrder"
          value={formData.sortOrder}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="0"
          min="0"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Location Photo</label>
        <LocationImageUploadWithCrop
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
          {isSubmitting ? "Adding..." : "Add Location"}
        </Button>
      </div>
    </form>
  );
}