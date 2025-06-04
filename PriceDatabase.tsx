import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Search, RefreshCw, Edit, Check, X } from 'lucide-react';

type ProductPrice = {
  id: number;
  productId: number;
  storeId: number;
  price: string;
  updatedAt: string;
  product: {
    id: number;
    name: string;
    size: string | null;
    categoryId: number;
    category?: {
      id: number;
      name: string;
    };
  };
  store: {
    id: number;
    name: string;
    location: string;
  };
};

type Product = {
  id: number;
  name: string;
  size: string | null;
  categoryId: number;
};

type Store = {
  id: number;
  name: string;
  location: string;
};

type Category = {
  id: number;
  name: string;
};

export default function PriceDatabase() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newProductName, setNewProductName] = useState('');
  const [newProductSize, setNewProductSize] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<string>('');
  const [newProductStore, setNewProductStore] = useState<string>('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSizeProductId, setEditingSizeProductId] = useState<number | null>(null);
  const [editingSizeValue, setEditingSizeValue] = useState<string>('');
  const sizeInputRef = useRef<HTMLInputElement>(null);

  // Fetch all product prices with product and store details
  const { data: productPrices, isLoading: pricesLoading } = useQuery({
    queryKey: ['/api/product-prices/details'],
    select: (data: ProductPrice[]) => {
      // Filter based on search term and selected filters
      return data.filter(item => {
        const matchesSearch = searchTerm 
          ? item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) 
          : true;
        
        const matchesStore = selectedStore && selectedStore !== 'all'
          ? item.storeId === parseInt(selectedStore) 
          : true;
        
        const matchesCategory = selectedCategory && selectedCategory !== 'all'
          ? item.product.categoryId === parseInt(selectedCategory) 
          : true;
        
        return matchesSearch && matchesStore && matchesCategory;
      });
    }
  });

  // Fetch stores for filter and form
  const { data: stores = [], isLoading: storesLoading } = useQuery<Store[]>({
    queryKey: ['/api/stores'],
  });

  // Fetch categories for filter and form
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Add new price mutation
  const addPriceMutation = useMutation({
    mutationFn: (data: { productName: string; productSize: string; categoryId: number; storeId: number; price: string }) => {
      return apiRequest('/api/product-prices/add', {
        method: 'POST',
        data
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Price added',
        description: 'The product price has been added to the database.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/product-prices/details'] });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to add product price: ${error}`,
        variant: 'destructive',
      });
    }
  });

  // Update price mutation
  const updatePriceMutation = useMutation({
    mutationFn: (data: { id: number; price: string }) => {
      return apiRequest(`/api/product-prices/${data.id}`, {
        method: 'PATCH',
        data: { price: data.price }
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Price updated',
        description: 'The product price has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/product-prices/details'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update product price: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  // Update product size mutation
  const updateSizeMutation = useMutation({
    mutationFn: (data: { productId: number; size: string | null }) => {
      return apiRequest(`/api/product-prices/product/${data.productId}/size`, {
        method: 'PATCH',
        data: { size: data.size }
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Size updated',
        description: 'The product size has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/product-prices/details'] });
      setEditingSizeProductId(null);
      setEditingSizeValue('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update product size: ${error}`,
        variant: 'destructive',
      });
    }
  });

  const resetForm = () => {
    setNewProductName('');
    setNewProductSize('');
    setNewProductCategory('');
    setNewProductStore('');
    setNewProductPrice('');
    setShowAddForm(false);
  };

  const handleAddPrice = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProductName || !newProductCategory || !newProductStore || !newProductPrice) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    addPriceMutation.mutate({
      productName: newProductName,
      productSize: newProductSize,
      categoryId: parseInt(newProductCategory),
      storeId: parseInt(newProductStore),
      price: newProductPrice
    });
  };

  const handlePriceUpdate = (id: number, newPrice: string) => {
    if (!newPrice || isNaN(parseFloat(newPrice))) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid price.',
        variant: 'destructive',
      });
      return;
    }

    updatePriceMutation.mutate({
      id,
      price: newPrice
    });
  };
  
  const handleSizeEdit = (productId: number) => {
    // Find the current product to get its size
    const product = productPrices?.find(item => item.product.id === productId)?.product;
    if (product) {
      setEditingSizeProductId(productId);
      setEditingSizeValue(product.size || '');
      // Focus the input after it's rendered
      setTimeout(() => {
        if (sizeInputRef.current) {
          sizeInputRef.current.focus();
        }
      }, 10);
    }
  };
  
  const handleSizeUpdate = (productId: number) => {
    updateSizeMutation.mutate({
      productId,
      size: editingSizeValue || null
    });
  };
  
  const handleSizeCancel = () => {
    setEditingSizeProductId(null);
    setEditingSizeValue('');
  };

  // Format currency for display
  const formatPrice = (price: string | number) => {
    return `$${parseFloat(price.toString()).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const isLoading = pricesLoading || storesLoading || categoriesLoading;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Regular Price Database</h1>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2"
        >
          {showAddForm ? 'Cancel' : <><Plus size={16} /> Add New Price</>}
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Product Price</CardTitle>
            <CardDescription>
              Enter details to add a new product and its regular price to the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddPrice} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productSize">Product Size</Label>
                  <Input
                    id="productSize"
                    value={newProductSize}
                    onChange={(e) => setNewProductSize(e.target.value)}
                    placeholder="Enter size (e.g., 16oz, 1lb, etc.)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newProductCategory}
                    onValueChange={setNewProductCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store">Store</Label>
                  <Select
                    value={newProductStore}
                    onValueChange={setNewProductStore}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores?.map((store: Store) => (
                        <SelectItem key={store.id} value={store.id.toString()}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regularPrice">Regular Price</Label>
                  <Input
                    id="regularPrice"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="Enter regular price"
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={addPriceMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {addPriceMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Add Product Price
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Price Database</CardTitle>
          <CardDescription>
            A collection of regular prices for products at different stores
          </CardDescription>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedStore}
                onValueChange={setSelectedStore}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores?.map((store: Store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/product-prices/details'] })}
                className="flex items-center gap-1"
              >
                <RefreshCw size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : productPrices && productPrices.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Regular Price</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productPrices.map((item: ProductPrice) => (
                    <TableRow key={item.id} className="group">
                      <TableCell className="font-medium">
                        {item.product.name}
                      </TableCell>
                      <TableCell>
                        {editingSizeProductId === item.product.id ? (
                          <div className="flex items-center space-x-1">
                            <Input
                              ref={sizeInputRef}
                              value={editingSizeValue}
                              onChange={(e) => setEditingSizeValue(e.target.value)}
                              className="w-24 h-8 text-sm"
                              placeholder="Enter size"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSizeUpdate(item.product.id);
                                } else if (e.key === 'Escape') {
                                  handleSizeCancel();
                                }
                              }}
                            />
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8" 
                              onClick={() => handleSizeUpdate(item.product.id)}
                              disabled={updateSizeMutation.isPending}
                            >
                              {updateSizeMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8" 
                              onClick={handleSizeCancel}
                              disabled={updateSizeMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span>{item.product.size || "-"}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100"
                              onClick={() => handleSizeEdit(item.product.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{item.product.category?.name || "-"}</TableCell>
                      <TableCell>{formatPrice(item.price)}</TableCell>
                      <TableCell>{formatDate(item.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-20 h-8 text-sm"
                            placeholder="New price"
                            onBlur={(e) => {
                              if (e.target.value && e.target.value !== item.price) {
                                handlePriceUpdate(item.id, e.target.value);
                              }
                              e.target.value = "";
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value) {
                                handlePriceUpdate(item.id, e.currentTarget.value);
                                e.currentTarget.value = "";
                              }
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No product prices found.</p>
              <p className="text-sm text-muted-foreground mt-2">Add some products and their regular prices to build your database.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}