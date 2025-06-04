import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, FileText, Activity, Settings, LogOut, FileVideo } from "lucide-react";
import SeedCTAContent from "@/seed/SeedCTAContent";
import { useToast } from "@/hooks/use-toast";

export function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-teal-800">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your Complete Eating Care website content
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/">
            <Button variant="outline">View Public Website</Button>
          </Link>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </div>

      {user && (
        <div className="bg-teal-50 p-4 rounded-lg mb-8 shadow-sm">
          <p className="text-teal-800">
            Welcome, <span className="font-bold">{user.name || user.username}</span>. 
            You can use this dashboard to manage the content of your website.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-teal-50">
            <CardTitle className="flex items-center gap-2 text-teal-800">
              <MapPin className="h-5 w-5" /> Location Management
            </CardTitle>
            <CardDescription>
              Manage treatment center locations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <p className="text-gray-600 mb-4">
              Add, edit, or remove treatment center locations. Update contact details,
              hours of operation, and featured status.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/locations" className="w-full">
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                Manage Locations
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Users className="h-5 w-5" /> Staff Management
            </CardTitle>
            <CardDescription>
              Manage staff and team members
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <p className="text-gray-600 mb-4">
              Add, edit, or remove staff members. Update biographies, titles,
              credentials, and leadership status.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/staff" className="w-full">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Manage Staff
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Activity className="h-5 w-5" /> Treatment Programs
            </CardTitle>
            <CardDescription>
              Manage treatments and services
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <p className="text-gray-600 mb-4">
              Add, edit, or remove treatment programs and services. Update details,
              descriptions, and availability at locations.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/treatments" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Manage Treatments
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-amber-50">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <FileText className="h-5 w-5" /> Content Management
            </CardTitle>
            <CardDescription>
              Manage site content and text
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <p className="text-gray-600 mb-4">
              Edit homepage content, section titles, and other site text. Customize messaging
              throughout the website.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/content" className="w-full">
              <Button className="w-full bg-amber-600 hover:bg-amber-700">
                Manage Content
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-rose-50">
            <CardTitle className="flex items-center gap-2 text-rose-800">
              <FileVideo className="h-5 w-5" /> Video Management
            </CardTitle>
            <CardDescription>
              Manage hero video content
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <p className="text-gray-600 mb-4">
              Upload, replace, or remove the therapy video displayed in the hero section 
              of the homepage. Support for MP4, WebM, and other video formats.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/video" className="w-full">
              <Button className="w-full bg-rose-600 hover:bg-rose-700">
                Manage Video
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Settings className="h-5 w-5" /> Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <p className="text-gray-600 mb-4">
              Update your account details, password, and preferences. Manage
              access to the admin dashboard.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline">
              Account Settings (Coming Soon)
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Development Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SeedCTAContent />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;