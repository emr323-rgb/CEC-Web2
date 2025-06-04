import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Treatment, InsertTreatment, insertTreatmentSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Image, Loader2, Pencil, Plus, Trash } from "lucide-react";
import TreatmentImageUploadWithCrop from "./TreatmentImageUploadWithCrop";

interface TreatmentsListProps {
  treatments: Treatment[];
  isLoading: boolean;
}

export function TreatmentsList({ treatments, isLoading }: TreatmentsListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Form validation schema (extending the insert schema with required fields)
  const formSchema = insertTreatmentSchema.extend({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    description: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
  });

  // Create a form for adding a new treatment
  const addForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
    },
  });

  // Create a form for editing a treatment
  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
    },
  });

  // Mutation for adding a new treatment
  const addTreatmentMutation = useMutation({
    mutationFn: (newTreatment: InsertTreatment) => {
      return apiRequest("/api/center/treatments", {
        method: "POST",
        data: newTreatment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/center/treatments"] });
      setIsAddDialogOpen(false);
      addForm.reset();
      toast({
        title: "Success",
        description: "Treatment added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add treatment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for editing a treatment
  const editTreatmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsertTreatment }) => {
      return apiRequest(`/api/center/treatments/${id}`, {
        method: "PUT",
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/center/treatments"] });
      setIsEditDialogOpen(false);
      editForm.reset();
      toast({
        title: "Success",
        description: "Treatment updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update treatment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting a treatment
  const deleteTreatmentMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/center/treatments/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/center/treatments"] });
      setIsDeleteDialogOpen(false);
      setSelectedTreatment(null);
      toast({
        title: "Success",
        description: "Treatment deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete treatment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddSubmit = (data: z.infer<typeof formSchema>) => {
    addTreatmentMutation.mutate(data);
  };

  const handleEditSubmit = (data: z.infer<typeof formSchema>) => {
    if (selectedTreatment) {
      editTreatmentMutation.mutate({ id: selectedTreatment.id, data });
    }
  };

  const handleDelete = () => {
    if (selectedTreatment) {
      deleteTreatmentMutation.mutate(selectedTreatment.id);
    }
  };

  const openEditDialog = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    // Set form values
    editForm.reset({
      name: treatment.name,
      description: treatment.description || "",
      imageUrl: treatment.imageUrl || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Treatment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Treatment</DialogTitle>
              <DialogDescription>
                Enter the details for the new treatment or service
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Treatment name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description of the treatment" 
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treatment Image</FormLabel>
                      <FormControl>
                        <TreatmentImageUploadWithCrop
                          onImageUploaded={(url) => {
                            addForm.setValue("imageUrl", url);
                          }}
                          existingImageUrl={field.value || undefined}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button 
                    type="submit"
                    disabled={addTreatmentMutation.isPending}
                  >
                    {addTreatmentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Treatment
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {treatments && treatments.length > 0 ? (
            treatments.map((treatment) => (
              <TableRow key={treatment.id}>
                <TableCell>
                  {treatment.imageUrl ? (
                    <div className="w-16 h-12 relative rounded overflow-hidden">
                      <img
                        src={treatment.imageUrl}
                        alt={treatment.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-12 bg-gray-100 flex items-center justify-center rounded">
                      <Image className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{treatment.name}</TableCell>
                <TableCell className="max-w-md truncate">
                  {treatment.description ? treatment.description.substring(0, 80) + "..." : ""}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditDialog(treatment)}
                    className="mr-2"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openDeleteDialog(treatment)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No treatments found. Add your first treatment to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Edit Treatment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Treatment</DialogTitle>
            <DialogDescription>
              Update the details for this treatment or service
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Treatment name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description of the treatment" 
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Treatment Image</FormLabel>
                    <FormControl>
                      <TreatmentImageUploadWithCrop
                        onImageUploaded={(url) => {
                          editForm.setValue("imageUrl", url);
                        }}
                        existingImageUrl={field.value || undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit"
                  disabled={editTreatmentMutation.isPending}
                >
                  {editTreatmentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the treatment "{selectedTreatment?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTreatmentMutation.isPending}
            >
              {deleteTreatmentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}