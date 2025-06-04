import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, UploadIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formSchema = z.object({
  spreadsheet: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Please select a file")
    .refine(
      (files) => files[0].name.endsWith(".csv"),
      "Only CSV files are supported"
    ),
  weekOf: z.date({
    required_error: "Please select the week date for this import",
  }),
});

type FormValues = z.infer<typeof formSchema>;

type AnalyzedItem = {
  itemName: string;
  storeId: number;
  regularPrice: string;
  salePrice: string;
  storeName: string;
  averagePrice?: number;
  marketSavingsPercent?: number;
};

type MissingProduct = {
  name: string;
  category: string;
  size?: string;
  storeId?: number;
  categoryId?: number;
  selected?: boolean;
};

export default function ImportSpreadsheet() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingMissing, setIsCheckingMissing] = useState(false);
  const [activeTab, setActiveTab] = useState("import");
  const [missingProducts, setMissingProducts] = useState<MissingProduct[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<{
    importId?: number;
    processedItems: number;
    analyzedItems: AnalyzedItem[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weekOf: new Date(),
    },
  });

  // Query categories and stores for the missing products form
  const { data: categories = [] } = useQuery<{id: number, name: string}[]>({
    queryKey: ['/api/categories'],
  });
  
  const { data: stores = [] } = useQuery<{id: number, name: string}[]>({
    queryKey: ['/api/stores'],
  });
  
  // Mutation to add multiple products at once
  const addProductsMutation = useMutation({
    mutationFn: (productsToAdd: MissingProduct[]) => {
      console.log("Products to add:", productsToAdd);
      return apiRequest('/api/csv-import/add-products', {
        method: 'POST',
        data: {
          products: productsToAdd.map(p => ({
            name: p.name,
            size: p.size || null,
            categoryId: p.categoryId,
            storeId: p.storeId
          }))
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Products Added",
        description: "The selected products have been added to the database.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/product-prices/details'] });
      setMissingProducts([]);
      setActiveTab("import");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to add products",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  });
  
  // Check for missing products in the CSV file
  const checkMissingProducts = async (file: File) => {
    if (!file) return;
    
    setIsCheckingMissing(true);
    try {
      // Log file details for debugging
      console.log("Checking missing products - File details:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      
      // Read the file as text directly (avoid base64 encoding/decoding overhead)
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to read file as text"));
          }
        };
        reader.onerror = () => reject(new Error("Error reading file"));
        reader.readAsText(file); // Read directly as text instead of base64
      });
      
      console.log("File read successfully as text for missing products check, length:", fileContent.length);
      
      // Use a simple JSON POST without FormData for missing products check
      const payload = {
        filename: file.name,
        contentType: file.type,
        fileContent: fileContent
      };
      
      // Use fetch with retry logic
      const maxRetries = 3;
      let retryCount = 0;
      let response: Response | undefined;
      
      while (retryCount < maxRetries) {
        try {
          console.log(`Checking missing products (attempt ${retryCount + 1}/${maxRetries})...`);
          
          response = await fetch("/api/csv-import/check-missing-products", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            cache: "no-cache"
          });
          
          // If we get here, the request was successful
          break;
        } catch (fetchError) {
          retryCount++;
          console.error(`Fetch attempt ${retryCount} failed:`, fetchError);
          
          if (retryCount === maxRetries) {
            throw new Error(`Failed to check missing products after ${maxRetries} attempts: ${fetchError instanceof Error ? fetchError.message : 'Network error'}`);
          }
          
          // Wait before retrying (exponential backoff)
          const delay = 1000 * Math.pow(2, retryCount - 1); // 1s, 2s, 4s...
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      if (!response || !response.ok) {
        let errorText = "Failed to check for missing products";
        if (response) {
          try {
            const errorData = await response.json();
            errorText = errorData.message || errorText;
          } catch (e) {
            // If we can't parse the JSON, just use the status text
            errorText = `Error ${response.status}: ${response.statusText}`;
          }
        }
        throw new Error(errorText);
      }
      
      const result = await response.json();
      
      if (result.missingProducts.length === 0) {
        toast({
          title: "No Missing Products",
          description: "All products in the spreadsheet are already in the database.",
        });
        return;
      }
      
      // Initialize with default values
      const productsWithDefaults = result.missingProducts.map((product: {name: string, category: string, size?: string}) => {
        const matchingCategory = categories.find(c => 
          c.name.toLowerCase() === product.category.toLowerCase()
        );
        
        return {
          ...product,
          categoryId: matchingCategory ? matchingCategory.id : categories[0]?.id,
          storeId: stores[0]?.id,
          selected: true,
          size: product.size || ""
        };
      });
      
      setMissingProducts(productsWithDefaults);
      setActiveTab("missing");
      
      toast({
        title: "Missing Products Found",
        description: `Found ${result.missingProducts.length} products in the spreadsheet that are not in the database.`,
      });
    } catch (error) {
      console.error("Error checking missing products:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check for missing products",
      });
    } finally {
      setIsCheckingMissing(false);
    }
  };
  
  // Handle file selection for both import and checking missing products
  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) {
      setSelectedFile(null);
      return;
    }
    
    const file = files[0];
    setSelectedFile(file);
  };
  
  // Handle selection/deselection of all products
  const toggleSelectAll = (selected: boolean) => {
    setMissingProducts(missingProducts.map(product => ({
      ...product,
      selected
    })));
  };
  
  // Handle selection/deselection of a single product
  const toggleProductSelection = (index: number, selected: boolean) => {
    const updatedProducts = [...missingProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      selected
    };
    setMissingProducts(updatedProducts);
  };
  
  // Handle updating product details
  const updateProductDetail = (index: number, field: string, value: string | number) => {
    const updatedProducts = [...missingProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };
    setMissingProducts(updatedProducts);
  };
  
  // Handle adding selected products to the database
  const addSelectedProducts = () => {
    const selectedProducts = missingProducts.filter(p => p.selected);
    
    if (selectedProducts.length === 0) {
      toast({
        variant: "destructive",
        title: "No Products Selected",
        description: "Please select at least one product to add to the database.",
      });
      return;
    }
    
    // Validate that all required fields are filled
    const invalidProducts = selectedProducts.filter(p => !p.categoryId || !p.storeId);
    
    if (invalidProducts.length > 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please ensure all selected products have a category and store selected.",
      });
      return;
    }
    
    addProductsMutation.mutate(selectedProducts);
  };
  
  // Define a type for our expected result
  type ImportResult = {
    importId: number;
    processedItems: number;
    analyzedItems: AnalyzedItem[];
  };
  
  // Helper function to upload a single chunk with retry logic
  const uploadChunkWithRetry = async (payload: any): Promise<Response> => {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`Uploading chunk ${payload.chunkData.chunkIndex + 1}/${payload.chunkData.totalChunks} (attempt ${retryCount + 1}/${maxRetries})...`);
        
        const response = await fetch("/api/csv-import/csv-json", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload),
          cache: "no-cache"
        });
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        console.log(`Successfully uploaded chunk ${payload.chunkData.chunkIndex + 1}/${payload.chunkData.totalChunks}`);
        return response;
      } catch (error) {
        retryCount++;
        console.error(`Chunk upload attempt ${retryCount} failed:`, error);
        
        if (retryCount === maxRetries) {
          throw new Error(`Failed to upload chunk after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Network error'}`);
        }
        
        // Wait before retrying (exponential backoff)
        const delay = 1000 * Math.pow(2, retryCount - 1); // 1s, 2s, 4s...
        console.log(`Retrying chunk in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // This should never happen due to the throw in the loop above
    throw new Error("Failed to upload chunk");
  };

  const onSubmit = async (data: FormValues) => {
    setIsUploading(true);
    
    try {
      if (!data.spreadsheet || !data.spreadsheet.length) {
        throw new Error("Please select a file to upload");
      }
      
      const file = data.spreadsheet[0];
      
      // Log file details for debugging
      console.log("File details:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      
      // Read the file as a string directly
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to read file as text"));
          }
        };
        reader.onerror = () => reject(new Error("Error reading file"));
        reader.readAsText(file);
      });
      
      console.log("File read successfully as text, length:", fileContent.length);
      
      // Implement a chunked upload approach for large files
      const CHUNK_SIZE = 50000; // 50KB chunks
      const totalChunks = Math.ceil(fileContent.length / CHUNK_SIZE);
      
      console.log(`Uploading file in ${totalChunks} chunks of ${CHUNK_SIZE} bytes each`);
      
      // Create an array to store all chunk promises
      const chunkPromises: Promise<Response>[] = [];
      
      // For files smaller than chunk size, just upload in one go
      if (totalChunks === 1) {
        const payload = {
          filename: file.name,
          contentType: file.type,
          fileContent: fileContent,
          weekOf: data.weekOf.toISOString(),
          chunkData: {
            chunkIndex: 0,
            totalChunks: 1,
            isLastChunk: true
          }
        };
        
        chunkPromises.push(uploadChunkWithRetry(payload));
      } else {
        // For larger files, split into chunks
        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, fileContent.length);
          const chunk = fileContent.substring(start, end);
          
          const payload = {
            filename: file.name,
            contentType: file.type,
            fileContent: chunk,
            weekOf: data.weekOf.toISOString(),
            chunkData: {
              chunkIndex: i,
              totalChunks: totalChunks,
              isLastChunk: i === totalChunks - 1
            }
          };
          
          // Add a short delay between chunks to prevent overwhelming the server
          const chunkPromise = new Promise<Response>(async (resolve) => {
            await new Promise(r => setTimeout(r, i * 100)); // 100ms staggered delay
            const response = await uploadChunkWithRetry(payload);
            resolve(response);
          });
          
          chunkPromises.push(chunkPromise);
        }
      }
      
      // Wait for all chunks to be uploaded
      const responses = await Promise.all(chunkPromises);
      
      // Use the last response (from the last chunk) for the result
      const response = responses[responses.length - 1];
      
      if (!response || !response.ok) {
        let errorText = "Failed to upload file";
        if (response) {
          try {
            const errorData = await response.json();
            errorText = errorData.message || errorText;
          } catch (e) {
            // If we can't parse the JSON, just use the status text
            errorText = `Error ${response.status}: ${response.statusText}`;
          }
        }
        throw new Error(errorText);
      }
      
      const result = await response.json();

      // With XMLHttpRequest, our Promise already handles the status code check
      // So we've already thrown an error if the status wasn't in the 200-299 range

      toast({
        title: "Success!",
        description: `Imported ${result.processedItems} items from the spreadsheet.`,
      });

      setImportResults({
        importId: result.importId,
        processedItems: result.processedItems,
        analyzedItems: result.analyzedItems || [],
      });
      
      // Keep track of the file for potential missing product check later
      if (data.spreadsheet[0]) {
        setSelectedFile(data.spreadsheet[0]);
      }
    } catch (error) {
      console.error("Upload error:", error);
      
      // Log more debugging information
      try {
        if (error instanceof Error) {
          console.log("Error name:", error.name);
          console.log("Error message:", error.message);
          console.log("Error stack:", error.stack);
        } else {
          console.log("Non-Error object received:", error);
        }
      } catch (debugError) {
        console.log("Error while debugging:", debugError);
      }
      
      // Get a more user-friendly error message
      let errorMessage = "Failed to upload the spreadsheet";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Specific error messages for common issues
        if (errorMessage.includes('Unexpected token')) {
          errorMessage = "The spreadsheet format appears to be invalid. Please ensure it's a properly formatted CSV file.";
        } else if (errorMessage.includes('Store with ID')) {
          errorMessage = "One or more Store IDs in your spreadsheet don't exist in the system. Please check the store IDs and try again.";
        } else if (errorMessage.includes('Missing required field')) {
          errorMessage = "Your spreadsheet is missing required columns. Please ensure it has Product/Item Name, Store ID, and Sale Price columns.";
        } else if (errorMessage.toLowerCase().includes('parse')) {
          errorMessage = "There was an error parsing your spreadsheet. Please check the format and try again.";
        }
      } else if (error instanceof Response) {
        try {
          const errorData = await error.json();
          errorMessage = errorData.message || "Server error processing the file";
        } catch (e) {
          errorMessage = `HTTP Error: ${error.status}`;
        }
      }
      
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Import Sales Spreadsheet</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="import">Import CSV</TabsTrigger>
          <TabsTrigger value="missing" disabled={missingProducts.length === 0}>
            Missing Products {missingProducts.length > 0 && `(${missingProducts.length})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="import">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Spreadsheet</CardTitle>
                  <CardDescription>
                    Upload a CSV file containing sales data to analyze and compare with average market prices.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="spreadsheet"
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel>Spreadsheet File (CSV)</FormLabel>
                            <FormControl>
                              <Input
                                type="file"
                                accept=".csv"
                                onChange={(e) => {
                                  onChange(e.target.files);
                                  handleFileChange(e.target.files);
                                }}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Please upload a CSV file with columns for product/item name, store ID, and sale price. 
                              Column names like "Product", "Item", "Sale Price", etc. are automatically recognized.
                              Price formats like "$3.99" and "2/$5" are supported.
                              <br />
                              <a 
                                href="/csv-import-guide.md" 
                                target="_blank" 
                                className="text-primary hover:underline"
                              >
                                View the CSV Import Guide for detailed instructions
                              </a>
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weekOf"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Week of</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
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
                                    date > new Date() ||
                                    date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Select the week for this set of sales.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          type="submit" 
                          className="flex-1" 
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            "Processing..."
                          ) : (
                            <>
                              <UploadIcon className="mr-2 h-4 w-4" />
                              Upload and Analyze
                            </>
                          )}
                        </Button>
                        
                        {selectedFile && (
                          <Button 
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => checkMissingProducts(selectedFile)}
                            disabled={isCheckingMissing}
                          >
                            {isCheckingMissing ? (
                              "Checking..."
                            ) : (
                              "Check Missing Products"
                            )}
                          </Button>
                        )}
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              {importResults ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                    <CardDescription>
                      Processed {importResults.processedItems} items from the spreadsheet.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert className="mb-6">
                      <AlertTitle>Market Comparison</AlertTitle>
                      <AlertDescription>
                        The table below shows how each sale item compares to prices from NPGS, Evergreen Kosher, and Gourmet Glatt websites.
                        Regular prices are fetched directly from these websites where available.
                      </AlertDescription>
                    </Alert>

                    <div className="rounded-md border">
                      <Table>
                        <TableCaption>
                          Sale prices compared to average market prices.
                        </TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[300px]">Item</TableHead>
                            <TableHead>Store</TableHead>
                            <TableHead>Regular Price</TableHead>
                            <TableHead>Sale Price</TableHead>
                            <TableHead>Average Market Price</TableHead>
                            <TableHead className="text-right">Market Savings</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importResults.analyzedItems.map((item, index) => (
                            <TableRow key={`${item.itemName}-${item.storeId}-${index}`}>
                              <TableCell className="font-medium">{item.itemName}</TableCell>
                              <TableCell>{item.storeName}</TableCell>
                              <TableCell>${parseFloat(item.regularPrice).toFixed(2)}</TableCell>
                              <TableCell>${parseFloat(item.salePrice).toFixed(2)}</TableCell>
                              <TableCell>
                                {item.averagePrice 
                                  ? `$${item.averagePrice.toFixed(2)}` 
                                  : 'N/A'}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.marketSavingsPercent ? (
                                  <Badge 
                                    variant={item.marketSavingsPercent > 0 ? "default" : "destructive"}
                                    className="ml-auto"
                                  >
                                    {item.marketSavingsPercent > 0 
                                      ? `${item.marketSavingsPercent}% off` 
                                      : `${Math.abs(item.marketSavingsPercent)}% higher`}
                                  </Badge>
                                ) : (
                                  'N/A'
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Market Comparison</CardTitle>
                    <CardDescription>
                      Upload a spreadsheet to see how sale prices compare to average market prices.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <UploadIcon className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-center text-muted-foreground">
                      Upload a CSV spreadsheet to analyze sale prices against average market prices.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="missing">
          <Card>
            <CardHeader>
              <CardTitle>Missing Products</CardTitle>
              <CardDescription>
                These products from your spreadsheet are not in the price database. Add them to track regular prices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {missingProducts.length > 0 ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="select-all"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={missingProducts.every(p => p.selected)}
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                      />
                      <label htmlFor="select-all" className="text-sm font-medium">
                        Select All Products ({missingProducts.length})
                      </label>
                    </div>
                    <Button
                      onClick={addSelectedProducts}
                      disabled={!missingProducts.some(p => p.selected) || addProductsMutation.isPending}
                    >
                      {addProductsMutation.isPending ? (
                        "Adding Products..."
                      ) : (
                        "Add Selected Products"
                      )}
                    </Button>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Select</TableHead>
                          <TableHead className="w-[250px]">Product Name</TableHead>
                          <TableHead className="w-[120px]">Size</TableHead>
                          <TableHead className="w-[150px]">Category</TableHead>
                          <TableHead className="w-[150px]">Store</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {missingProducts.map((product, index) => (
                          <TableRow key={`missing-${index}`}>
                            <TableCell>
                              <input 
                                type="checkbox" 
                                checked={product.selected}
                                onChange={(e) => toggleProductSelection(index, e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>
                              <Input
                                value={product.size || ""}
                                onChange={(e) => updateProductDetail(index, "size", e.target.value)}
                                placeholder="Size (e.g., 16oz)"
                                className="h-8 text-sm"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={product.categoryId?.toString() || ""}
                                onValueChange={(value) => updateProductDetail(index, "categoryId", parseInt(value))}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={product.storeId?.toString() || ""}
                                onValueChange={(value) => updateProductDetail(index, "storeId", parseInt(value))}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Select store" />
                                </SelectTrigger>
                                <SelectContent>
                                  {stores.map((store) => (
                                    <SelectItem key={store.id} value={store.id.toString()}>
                                      {store.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground">
                    No missing products found. All products in your spreadsheet are already in the database.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("import")}>
                Back to Import
              </Button>
              <Button
                onClick={addSelectedProducts}
                disabled={!missingProducts.some(p => p.selected) || addProductsMutation.isPending}
              >
                {addProductsMutation.isPending ? (
                  "Adding Products..."
                ) : (
                  "Add Selected Products"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}