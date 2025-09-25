"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, DollarSign, Package } from "lucide-react";
import { apiClient } from "@/lib/api";

interface SalesManagementModalProps {
  onSaleRecorded?: () => void;
}

export default function SalesManagementModal({ onSaleRecorded }: SalesManagementModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  
  // Product creation form
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    cost: "",
    category: "other",
    stock: ""
  });

  // Sales recording form
  const [saleForm, setSaleForm] = useState({
    product: "",
    quantity: "",
    unitPrice: "",
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    paymentMethod: "cash"
  });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const productsRes = await apiClient.getProducts();
      if (productsRes.success) setProducts(productsRes.products || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        cost: parseFloat(productForm.cost),
        stock: parseInt(productForm.stock) || 0,
        club: "default-club" // Single club system
      };

      console.log("Creating product with data:", productData);
      const response = await apiClient.createProduct(productData);
      console.log("Product creation response:", response);
      
      if (response.success) {
        alert("Product created successfully!");
        setProductForm({
          name: "",
          description: "",
          price: "",
          cost: "",
          category: "other",
          stock: ""
        });
        loadData(); // Reload products
      } else {
        alert(`Failed to create product: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert(`Failed to create product: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedProduct = products.find(p => p._id === saleForm.product);
      const saleData = {
        ...saleForm,
        quantity: parseInt(saleForm.quantity),
        unitPrice: parseFloat(saleForm.unitPrice),
        totalAmount: parseInt(saleForm.quantity) * parseFloat(saleForm.unitPrice),
        club: "default-club", // Single club system
        buyer: {
          name: saleForm.buyerName,
          email: saleForm.buyerEmail,
          phone: saleForm.buyerPhone
        }
      };

      const response = await apiClient.createSale(saleData);
      
      if (response.success) {
        alert("Sale recorded successfully!");
        setSaleForm({
          product: "",
          quantity: "",
          unitPrice: "",
          buyerName: "",
          buyerEmail: "",
          buyerPhone: "",
          paymentMethod: "cash"
        });
        onSaleRecorded?.();
      } else {
        alert("Failed to record sale. Please try again.");
      }
    } catch (error) {
      console.error("Error recording sale:", error);
      alert("Failed to record sale. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      setSaleForm(prev => ({
        ...prev,
        product: productId,
        unitPrice: product.price.toString()
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <DollarSign className="w-4 h-4 mr-2" />
          Record Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sales Management</DialogTitle>
          <DialogDescription>
            Create products and record sales transactions.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="record-sale" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="record-sale">Record Sale</TabsTrigger>
            <TabsTrigger value="create-product">Create Product</TabsTrigger>
          </TabsList>

          <TabsContent value="record-sale" className="space-y-4">
            <form onSubmit={handleRecordSale} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select value={saleForm.product} onValueChange={handleProductSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name} - ${product.price} (Stock: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={saleForm.unitPrice}
                    onChange={(e) => setSaleForm(prev => ({ ...prev, unitPrice: e.target.value }))}
                    placeholder="Enter unit price"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyerName">Buyer Name</Label>
                <Input
                  id="buyerName"
                  value={saleForm.buyerName}
                  onChange={(e) => setSaleForm(prev => ({ ...prev, buyerName: e.target.value }))}
                  placeholder="Enter buyer name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buyerEmail">Buyer Email</Label>
                  <Input
                    id="buyerEmail"
                    type="email"
                    value={saleForm.buyerEmail}
                    onChange={(e) => setSaleForm(prev => ({ ...prev, buyerEmail: e.target.value }))}
                    placeholder="Enter buyer email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyerPhone">Buyer Phone</Label>
                  <Input
                    id="buyerPhone"
                    value={saleForm.buyerPhone}
                    onChange={(e) => setSaleForm(prev => ({ ...prev, buyerPhone: e.target.value }))}
                    placeholder="Enter buyer phone"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={saleForm.paymentMethod} onValueChange={(value) => setSaleForm(prev => ({ ...prev, paymentMethod: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Recording..." : "Record Sale"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="create-product" className="space-y-4">
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productDescription">Description</Label>
                <Textarea
                  id="productDescription"
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter product description"
                  required
                />
              </div>


              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productPrice">Price</Label>
                  <Input
                    id="productPrice"
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Enter price"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productCost">Cost</Label>
                  <Input
                    id="productCost"
                    type="number"
                    step="0.01"
                    value={productForm.cost}
                    onChange={(e) => setProductForm(prev => ({ ...prev, cost: e.target.value }))}
                    placeholder="Enter cost"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productStock">Stock</Label>
                  <Input
                    id="productStock"
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="Enter stock"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productCategory">Category</Label>
                <Select value={productForm.category} onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merchandise">Merchandise</SelectItem>
                    <SelectItem value="tickets">Tickets</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Product"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
