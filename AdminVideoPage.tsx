import AdminLayout from '@/layouts/AdminLayout';
import { VideoManager } from '@/components/admin/VideoManager';
import { Separator } from '@/components/ui/separator';
import { FileVideo } from 'lucide-react';

export default function AdminVideoPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileVideo className="h-8 w-8 text-[#5a9e97]" />
            Video Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage the therapy video displayed on the homepage hero section.
          </p>
        </div>
        <Separator />
        
        <VideoManager />
      </div>
    </AdminLayout>
  );
}