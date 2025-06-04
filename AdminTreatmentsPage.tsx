import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { TreatmentsList } from "@/components/admin/TreatmentsList";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Treatment } from "@shared/schema";

export default function AdminTreatmentsPage() {
  const { data: treatments, isLoading } = useQuery<Treatment[]>({
    queryKey: ["/api/center/treatments"],
  });

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Treatment Programs</CardTitle>
            <CardDescription>
              Add, edit, or remove treatment programs and services offered at your locations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <TreatmentsList treatments={Array.isArray(treatments) ? treatments : []} isLoading={isLoading} />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}