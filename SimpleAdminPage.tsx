import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, FileEdit, Home, LogOut, Plus, Settings, Shield, Users, Video } from "lucide-react";
import { Link, Redirect, useLocation } from "wouter";
import AdminLayout from "@/layouts/AdminLayout";

export default function SimpleAdminPage() {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  
  if (!user) {
    return <Redirect to="/login" />;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#005a8e]">Admin Dashboard</h1>
            <p className="text-gray-500">Manage your website content</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">Welcome, {user.name || user.username}</p>
              <p className="text-sm text-gray-500">Administrator</p>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut size={18} />
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="locations">
              <Building2 className="mr-2 h-4 w-4" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="staff">
              <Users className="mr-2 h-4 w-4" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="insurance">
              <Shield className="mr-2 h-4 w-4" />
              Insurance Providers
            </TabsTrigger>
            <TabsTrigger value="content">
              <FileEdit className="mr-2 h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="media">
              <Video className="mr-2 h-4 w-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Locations</CardTitle>
                  <CardDescription>Manage treatment center locations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#005a8e]">3</div>
                  <p className="text-sm text-gray-500">Active locations</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button onClick={() => navigate("/admin/locations")} className="w-full gap-2">
                    <Building2 size={16} />
                    Manage Locations
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Staff</CardTitle>
                  <CardDescription>Manage clinical staff</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#005a8e]">6</div>
                  <p className="text-sm text-gray-500">Team members</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button onClick={() => navigate("/admin/staff")} className="w-full gap-2">
                    <Users size={16} />
                    Manage Staff
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Insurance</CardTitle>
                  <CardDescription>Manage accepted providers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#005a8e]">8</div>
                  <p className="text-sm text-gray-500">Insurance providers</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button onClick={() => navigate("/admin/insurance")} className="w-full gap-2">
                    <Shield size={16} />
                    Manage Insurance
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Content</CardTitle>
                  <CardDescription>Manage website content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#005a8e]">12</div>
                  <p className="text-sm text-gray-500">Content items</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button onClick={() => navigate("/admin/content")} className="w-full gap-2">
                    <FileEdit size={16} />
                    Edit Content
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Button onClick={() => navigate("/admin/locations")} variant="outline" className="h-auto py-4 flex-col items-center justify-center gap-2">
                <Plus size={20} />
                <span>Add Location</span>
              </Button>
              <Button onClick={() => navigate("/admin/staff")} variant="outline" className="h-auto py-4 flex-col items-center justify-center gap-2">
                <Plus size={20} />
                <span>Add Staff Member</span>
              </Button>
              <Button onClick={() => navigate("/admin/insurance")} variant="outline" className="h-auto py-4 flex-col items-center justify-center gap-2">
                <Plus size={20} />
                <span>Add Insurance Provider</span>
              </Button>
              <Button onClick={() => navigate("/admin/media")} variant="outline" className="h-auto py-4 flex-col items-center justify-center gap-2">
                <Video size={20} />
                <span>Upload Video</span>
              </Button>
              <Button onClick={() => navigate("/admin/content")} variant="outline" className="h-auto py-4 flex-col items-center justify-center gap-2">
                <FileEdit size={20} />
                <span>Edit Homepage</span>
              </Button>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Recent Updates</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <div className="flex items-center p-4">
                      <div className="flex-1">
                        <p className="font-medium">Homepage hero updated</p>
                        <p className="text-sm text-gray-500">Today at 10:35 AM</p>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                    <div className="flex items-center p-4">
                      <div className="flex-1">
                        <p className="font-medium">New staff member added</p>
                        <p className="text-sm text-gray-500">Yesterday at 2:15 PM</p>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                    <div className="flex items-center p-4">
                      <div className="flex-1">
                        <p className="font-medium">Location details updated</p>
                        <p className="text-sm text-gray-500">May 8, 2023</p>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Locations Management</CardTitle>
                    <CardDescription>Add, edit, or remove treatment center locations</CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus size={16} />
                    Add Location
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-center py-12 text-gray-500">
                  Location management functionality coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="staff">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Staff Management</CardTitle>
                    <CardDescription>Add, edit, or remove staff members</CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus size={16} />
                    Add Staff
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-center py-12 text-gray-500">
                  Staff management functionality coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="insurance">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Insurance Providers Management</CardTitle>
                    <CardDescription>Add, edit, or remove accepted insurance providers</CardDescription>
                  </div>
                  <Button onClick={() => navigate("/admin/insurance")} className="gap-2">
                    <Plus size={16} />
                    Add Provider
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Manage insurance providers that appear in the carousel on the homepage. 
                  Upload provider logos, control the display order, and toggle visibility.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="border rounded-lg p-4 flex flex-col items-center justify-center text-center">
                      <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-3">
                        <Shield className="h-8 w-8 text-primary" />
                      </div>
                      <p className="font-medium">Insurance {i}</p>
                      <p className="text-sm text-gray-500">Provider #{i}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate("/admin/insurance")} className="w-full">
                  Manage All Insurance Providers
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Content Management</CardTitle>
                    <CardDescription>Edit website content and sections</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {/* Homepage Hero Video Section */}
                  <div className="border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Video className="h-6 w-6 text-primary" />
                      <h3 className="text-lg font-medium">Homepage Hero Video</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                      Upload a video to be displayed in the homepage hero section. The video will automatically
                      play when visitors arrive on the homepage.
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded-md mb-6">
                      <h4 className="text-sm font-medium mb-2">Content Location</h4>
                      <p className="text-xs text-gray-500">This video will appear at the top of the homepage as a fullscreen background.</p>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-sm font-medium mb-2">Video Guidelines</h4>
                      <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
                        <li>Recommended resolution: 1920x1080 or higher</li>
                        <li>Maximum file size: 100MB</li>
                        <li>Supported formats: MP4, WebM, Ogg</li>
                        <li>Ideal length: 30-60 seconds for looped videos</li>
                        <li>Content should represent healing, therapy, and recovery</li>
                      </ul>
                    </div>
                    
                    <div className="mt-4 space-y-4">
                      <Link href="/admin/content/video/hero">
                        <Button className="w-full">
                          Manage Direct Video Upload
                        </Button>
                      </Link>
                      
                      <Link href="/admin/content/embedded-video/homepage_hero_video">
                        <Button className="w-full" variant="outline">
                          Manage YouTube/Vimeo Embed
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Other Content Sections Placeholder */}
                  <div className="border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <FileEdit className="h-6 w-6 text-primary" />
                      <h3 className="text-lg font-medium">Homepage Sections</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Edit titles, descriptions, and other content sections throughout the website.
                    </p>
                    <div className="mt-4">
                      <Link href="/admin/content">
                        <Button variant="outline" className="w-full sm:w-auto">
                          Manage Content
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Media Management</CardTitle>
                    <CardDescription>Upload and manage videos and images</CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus size={16} />
                    Upload Media
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-center py-12 text-gray-500">
                  Media management functionality coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>Configure admin preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-12 text-gray-500">
                  Settings functionality coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}