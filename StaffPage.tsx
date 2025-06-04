import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Users } from "lucide-react";

interface StaffFormData {
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  email: string;
  phone: string;
  locationId: number | null;
  specialty: string;
  isLeadership: boolean;
  sortOrder: number;
}

export default function StaffPage() {
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<any>(null);
  const [formData, setFormData] = useState<StaffFormData>({
    name: "",
    title: "",
    bio: "",
    imageUrl: "",
    email: "",
    phone: "",
    locationId: 0,
    specialty: "",
    isLeadership: false,
    sortOrder: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: staff = [], isLoading: isLoadingStaff } = useQuery({
    queryKey: ['/api/center/staff'],
  });

  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['/api/center/locations'],
  });

  useEffect(() => {
    if (locations.length > 0 && !formData.locationId) {
      setFormData(prev => ({ ...prev, locationId: locations[0].id }));
    }
  }, [locations, formData.locationId]);

  const createStaffMutation = useMutation({
    mutationFn: (staffData: StaffFormData) => {
      return apiRequest("POST", "/api/center/staff", staffData);
    },
    onSuccess: () => {
      toast({
        title: "Staff member added",
        description: "The staff member has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/center/staff'] });
      setIsAddStaffOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add staff member. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding staff member:", error);
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<StaffFormData> }) => {
      return apiRequest("PUT", `/api/center/staff/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Staff member updated",
        description: "The staff member has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/center/staff'] });
      setIsEditStaffOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update staff member. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating staff member:", error);
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/center/staff/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Staff member deleted",
        description: "The staff member has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/center/staff'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete staff member. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting staff member:", error);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    if (type === 'checkbox' && name === 'isLeadership') {
      // If leadership is checked, set locationId to null
      // If leadership is unchecked, set locationId to the first location if available
      setFormData((prev) => ({ 
        ...prev, 
        isLeadership: checked,
        locationId: checked ? null : (locations.length > 0 ? locations[0].id : null)
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "locationId") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditStaffOpen && currentStaff) {
      updateStaffMutation.mutate({ id: currentStaff.id, data: formData });
    } else {
      createStaffMutation.mutate(formData);
    }
  };

  const openEditDialog = (staffMember: any) => {
    setCurrentStaff(staffMember);
    setFormData({
      name: staffMember.name,
      title: staffMember.title,
      bio: staffMember.bio || "",
      imageUrl: staffMember.imageUrl || "",
      email: staffMember.email || "",
      phone: staffMember.phone || "",
      locationId: staffMember.locationId,
      specialty: staffMember.specialty || "",
      isLeadership: staffMember.isLeadership || false,
      sortOrder: staffMember.sortOrder || 0
    });
    setIsEditStaffOpen(true);
  };

  const handleDeleteStaff = (id: number) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      deleteStaffMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      bio: "",
      imageUrl: "",
      email: "",
      phone: "",
      locationId: locations.length > 0 ? locations[0].id : null,
      specialty: "",
      isLeadership: false,
      sortOrder: 0
    });
    setCurrentStaff(null);
  };

  const getLocationName = (locationId: number | null) => {
    if (locationId === null) return "Organization-wide (Leadership)";
    const location = locations.find((loc: any) => loc.id === locationId);
    return location ? location.name : "Unknown";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Staff Management</h1>
          <p className="text-gray-600">
            Manage treatment team members across all locations
          </p>
        </div>
        <Button 
          onClick={() => setIsAddStaffOpen(true)} 
          className="mt-4 md:mt-0 flex items-center gap-2"
          disabled={locations.length === 0}
        >
          <Plus size={16} />
          Add Staff Member
        </Button>
      </div>

      {isLoadingStaff ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="flex items-center">
                <Skeleton className="h-24 w-24 rounded-full mb-4" />
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {staff.map((staffMember: any) => (
            <Card key={staffMember.id} className="overflow-hidden">
              <CardHeader className="flex flex-col items-center text-center">
                {staffMember.imageUrl ? (
                  <img 
                    src={`${staffMember.imageUrl}?v=${Date.now()}`} 
                    alt={staffMember.name} 
                    className="h-32 w-32 object-cover rounded-full mb-4 border-2 border-primary"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 border-2 border-primary">
                    <Users size={40} className="text-gray-400" />
                  </div>
                )}
                <CardTitle className="text-xl">{staffMember.name}</CardTitle>
                <p className="text-primary font-medium">{staffMember.title}</p>
                {staffMember.isLeadership && (
                  <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full mt-2">
                    Leadership Team
                  </span>
                )}
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 line-clamp-3">
                  {staffMember.bio || "Team member at Complete Eating Care, dedicated to providing excellent patient care."}
                </p>
                <p className="mt-2 text-gray-500 text-sm">
                  Location: {getLocationName(staffMember.locationId)}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => openEditDialog(staffMember)}
                  className="flex items-center gap-1"
                >
                  <Edit size={14} />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteStaff(staffMember.id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Staff Dialog */}
      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Enter the details for the new staff member.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Clinical Director, Therapist, Registered Dietitian"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="specialty">Specialty Area</Label>
                  <Input
                    id="specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    placeholder="e.g., Family Therapy, Nutritional Counseling"
                  />
                </div>
                {!formData.isLeadership && (
                  <div className="col-span-2">
                    <Label htmlFor="locationId">Location</Label>
                    <Select 
                      value={formData.locationId?.toString() || ""} 
                      onValueChange={(value) => handleSelectChange("locationId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location: any) => (
                          <SelectItem key={location.id} value={location.id.toString()}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="bio">Biography</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="imageUrl">Profile Image URL</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="sortOrder">Display Order</Label>
                  <Input
                    id="sortOrder"
                    name="sortOrder"
                    type="number"
                    value={formData.sortOrder.toString()}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-span-1 flex items-center space-x-2 pt-8">
                  <input
                    type="checkbox"
                    id="isLeadership"
                    name="isLeadership"
                    checked={formData.isLeadership}
                    onChange={(e) => setFormData(prev => ({ ...prev, isLeadership: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <Label htmlFor="isLeadership" className="cursor-pointer">Leadership Team Member</Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Leadership staff appear on the main team page and oversee the entire organization. They won't be tied to a specific location.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAddStaffOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createStaffMutation.isPending}>
                {createStaffMutation.isPending ? "Saving..." : "Save Staff"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditStaffOpen} onOpenChange={setIsEditStaffOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
              <DialogDescription>
                Update the details for this staff member.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-title">Professional Title</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Clinical Director, Therapist, Registered Dietitian"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-specialty">Specialty Area</Label>
                  <Input
                    id="edit-specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    placeholder="e.g., Family Therapy, Nutritional Counseling"
                  />
                </div>
                {!formData.isLeadership && (
                  <div className="col-span-2">
                    <Label htmlFor="edit-locationId">Location</Label>
                    <Select 
                      value={formData.locationId?.toString() || ""} 
                      onValueChange={(value) => handleSelectChange("locationId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location: any) => (
                          <SelectItem key={location.id} value={location.id.toString()}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-bio">Biography</Label>
                  <Textarea
                    id="edit-bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-imageUrl">Profile Image URL</Label>
                  <Input
                    id="edit-imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="edit-sortOrder">Display Order</Label>
                  <Input
                    id="edit-sortOrder"
                    name="sortOrder"
                    type="number"
                    value={formData.sortOrder.toString()}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-span-1 flex items-center space-x-2 pt-8">
                  <input
                    type="checkbox"
                    id="edit-isLeadership"
                    name="isLeadership"
                    checked={formData.isLeadership}
                    onChange={(e) => setFormData(prev => ({ ...prev, isLeadership: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <Label htmlFor="edit-isLeadership" className="cursor-pointer">Leadership Team Member</Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Leadership staff appear on the main team page and oversee the entire organization. They won't be tied to a specific location.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditStaffOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateStaffMutation.isPending}>
                {updateStaffMutation.isPending ? "Updating..." : "Update Staff"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}