import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

const formSchema = z.object({
  itemName: z.string().min(3, "Item name must be at least 3 characters"),
  categoryId: z.coerce.number().positive("Please select a category"),
  storeId: z.coerce.number().positive("Please select a store"),
  regularPrice: z.string().min(1, "Regular price is required"),
  salePrice: z.string().min(1, "Sale price is required"),
  endDate: z.date().optional(),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function AddSale() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState(false);
  const [savings, setSavings] = useState("0.00");
  const [savingsPercent, setSavingsPercent] = useState("0");

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: stores = [] } = useQuery({
    queryKey: ['/api/stores'],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: "",
      categoryId: 0,
      storeId: 0,
      regularPrice: "",
      salePrice: "",
      notes: ""
    }
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      return apiRequest("POST", "/api/sales", data);
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Sale item added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/top'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      form.reset();
      setPreview(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add sale item. Please try again.",
        variant: "destructive"
      });
    }
  });

  const calculateSavings = () => {
    const regularPrice = parseFloat(form.getValues("regularPrice"));
    const salePrice = parseFloat(form.getValues("salePrice"));
    
    if (regularPrice > 0 && salePrice > 0) {
      const savingsAmount = regularPrice - salePrice;
      const savingsPercentage = Math.round((savingsAmount / regularPrice) * 100);
      
      setSavings(savingsAmount.toFixed(2));
      setSavingsPercent(savingsPercentage.toString());
      setPreview(true);
    }
  };

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  const resetForm = () => {
    form.reset();
    setPreview(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Add New Sale Item</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="itemName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Organic Milk" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="storeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a store" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stores.map((store: any) => (
                            <SelectItem key={store.id} value={store.id.toString()}>
                              {store.name} - {store.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Sale End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="regularPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regular Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Limit 4 per customer, must use store card"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {preview && (
                <Alert className="bg-gray-50 border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-2">Deal Preview</h3>
                  <div className="flex items-center justify-between">
                    <AlertDescription className="text-sm font-medium">
                      Total Savings:
                    </AlertDescription>
                    <span className="text-sm font-medium text-secondary">
                      ${savings} ({savingsPercent}%)
                    </span>
                  </div>
                </Alert>
              )}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={calculateSavings}
                  className="border-primary text-primary hover:bg-blue-50"
                >
                  Preview
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Adding..." : "Add Sale Item"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
