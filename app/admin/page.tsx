"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/nav";
import { supabase } from "@/lib/supabase";
import AOS from "aos";
import "aos/dist/aos.css";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  images: string[];
  category: string | null;
  weight: number | null;
  stock: number | null;
  created_at: string;
  updated_at: string;
}

interface NewProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  weight: string;
  stock: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newProduct, setNewProduct] = useState<NewProductForm>({
    name: "",
    description: "",
    price: "",
    category: "protein",
    weight: "",
    stock: "",
  });

  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [editingProductImage, setEditingProductImage] = useState<File | null>(
    null
  );
  const [imagePreview, setImagePreview] = useState<string>("");
  const [editImagePreview, setEditImagePreview] = useState<string>("");

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
    checkAdmin();
  }, []);

  useEffect(() => {
    if (newProductImage) {
      const objectUrl = URL.createObjectURL(newProductImage);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setImagePreview("");
    }
  }, [newProductImage]);

  useEffect(() => {
    if (editingProductImage) {
      const objectUrl = URL.createObjectURL(editingProductImage);
      setEditImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setEditImagePreview("");
    }
  }, [editingProductImage]);

  async function checkAdmin() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !profile || profile.role !== "admin") {
        router.push("/");
        return;
      }

      setIsAdmin(true);
      await fetchProducts();
    } catch (error) {
      console.error("Error checking admin status:", error);
      router.push("/");
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        setError("Failed to load products. Please try again later.");
        return;
      }

      if (!data || data.length === 0) {
        setProducts([]);
        return;
      }

      // Transform data to ensure proper types
      const transformedData = data.map((product) => ({
        ...product,
        images: Array.isArray(product.images)
          ? product.images
          : product.image_url
          ? [product.image_url]
          : [],
        category: product.category || "uncategorized",
        weight: product.weight || 0,
        stock: product.stock || 0,
      }));

      setProducts(transformedData);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  async function handleProductImageUpload(file: File): Promise<string | null> {
    try {
      setUploading(true);

      // Validate file
      if (file.size > 50 * 1024 * 1024) {
        throw new Error("File size must be less than 50MB");
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("Please select a valid image file");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      console.log("Uploading file to:", filePath);

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      console.log("Image uploaded successfully:", publicUrl);

      // Add a small delay to ensure the image is available
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading product image:", error);
      throw new Error(`Image upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!newProduct.name.trim()) {
        throw new Error("Product name is required");
      }
      if (!newProduct.price || parseFloat(newProduct.price) <= 0) {
        throw new Error("Valid price is required");
      }

      let imageUrl = null;
      let images: string[] = [];

      // Upload image if provided
      if (newProductImage) {
        console.log("Starting image upload...");
        imageUrl = await handleProductImageUpload(newProductImage);
        if (imageUrl) {
          images = [imageUrl];
        }
      }

      // Prepare product data
      const productData = {
        name: newProduct.name.trim(),
        description: newProduct.description.trim() || null,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        weight: newProduct.weight ? parseInt(newProduct.weight) : null,
        stock: newProduct.stock ? parseInt(newProduct.stock) : 0,
        image_url: imageUrl,
        images: images,
      };

      console.log("Inserting product data:", productData);

      const { data, error } = await supabase
        .from("products")
        .insert([productData])
        .select()
        .single();

      if (error) {
        console.error("Database insert error:", error);
        throw error;
      }

      console.log("Product added successfully:", data);
      setSuccess("Product added successfully!");

      // Reset form
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "protein",
        weight: "",
        stock: "",
      });
      setNewProductImage(null);
      setImagePreview("");

      // Refresh products list
      await fetchProducts();
    } catch (error: any) {
      console.error("Error adding product:", error);
      setError(error.message || "Failed to add product");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      let imageUrl = editingProduct.image_url;
      let images = editingProduct.images || [];

      if (editingProductImage) {
        const uploadedUrl = await handleProductImageUpload(editingProductImage);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          images = [uploadedUrl];
        }
      }

      const { error } = await supabase
        .from("products")
        .update({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          category: editingProduct.category,
          weight: editingProduct.weight,
          stock: editingProduct.stock,
          image_url: imageUrl,
          images: images,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingProduct.id);

      if (error) throw error;

      setSuccess("Product updated successfully!");
      setEditingProduct(null);
      setEditingProductImage(null);
      setEditImagePreview("");

      await fetchProducts();
    } catch (error: any) {
      console.error("Error updating product:", error);
      setError(error.message || "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteProduct(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;

      setSuccess("Product deleted successfully!");
      await fetchProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      setError(error.message || "Failed to delete product");
    }
  }

  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError("Image file size must be less than 50MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      setNewProductImage(file);
      setError("");
    }
  }

  function handleEditImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError("Image file size must be less than 50MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      setEditingProductImage(file);
      setError("");
    }
  }

  // Get product image with proper fallback
  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product.image_url) {
      return product.image_url;
    }
    return null;
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1 py-8">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Checking permissions...
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div data-aos="fade-up" className="mb-8">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Manage your products here
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900 dark:text-red-100">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-700 dark:bg-green-900 dark:text-green-100">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Add New Product Form */}
          <div
            data-aos="fade-up"
            className="mb-8 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
          >
            <h2 className="mb-6 text-xl font-bold">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="my-2">
                    Product Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    required
                    disabled={submitting || uploading}
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="my-2">
                    Price (USD) *
                  </Label>
                  <Input
                    id="price"
                    placeholder="Price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    required
                    disabled={submitting || uploading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="my-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Product description"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  disabled={submitting || uploading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="category" className="my-2">
                    Category
                  </Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value: string) =>
                      setNewProduct({ ...newProduct, category: value })
                    }
                    disabled={submitting || uploading}
                  >
                    <SelectTrigger className="min-w-xs">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="protein">Protein</SelectItem>
                      <SelectItem value="supplements">Supplements</SelectItem>
                      <SelectItem value="pre-workout">Pre-Workout</SelectItem>
                      <SelectItem value="amino acids">Amino Acids</SelectItem>
                      <SelectItem value="vitamins">Vitamins</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="weight" className="my-2">
                    Weight (grams)
                  </Label>
                  <Input
                    id="weight"
                    placeholder="Weight (g)"
                    type="number"
                    min="0"
                    value={newProduct.weight}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, weight: e.target.value })
                    }
                    disabled={submitting || uploading}
                  />
                </div>
                <div>
                  <Label htmlFor="stock" className="my-2">
                    Stock Quantity
                  </Label>
                  <Input
                    id="stock"
                    placeholder="Stock"
                    type="number"
                    min="0"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stock: e.target.value })
                    }
                    disabled={submitting || uploading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image" className="my-2">
                  Product Image
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={submitting || uploading}
                  className="file:mr-4 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Upload a product image (max 50MB). Supported formats: JPG,
                  PNG, WEBP, GIF
                </p>
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={submitting || uploading}
                className="w-full"
              >
                {submitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {uploading ? "Uploading Image..." : "Adding Product..."}
                  </div>
                ) : (
                  "Add Product"
                )}
              </Button>
            </form>
          </div>

          {/* Products List */}
          {loading ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
                >
                  <div className="aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-t-lg" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-neutral-200 rounded dark:bg-neutral-800 w-3/4" />
                    <div className="h-3 bg-neutral-200 rounded dark:bg-neutral-800 w-full" />
                    <div className="h-3 bg-neutral-200 rounded dark:bg-neutral-800 w-2/3" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-4 bg-neutral-200 rounded dark:bg-neutral-800 w-1/4" />
                      <div className="h-8 bg-neutral-200 rounded dark:bg-neutral-800 w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex h-96 items-center justify-center">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <svg
                    className="h-16 w-16 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="text-lg font-medium">{error}</p>
                </div>
                <Button onClick={fetchProducts} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                <svg
                  className="h-16 w-16 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm">
                  Add your first product using the form above
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  data-aos="fade-up"
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:shadow-neutral-700"
                >
                  {/* Stock indicator */}
                  {(product.stock || 0) <= 0 && (
                    <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                      Out of Stock
                    </div>
                  )}

                  {editingProduct?.id === product.id ? (
                    <form
                      onSubmit={handleUpdateProduct}
                      className="p-4 space-y-4"
                    >
                      <Input
                        value={editingProduct.name}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            name: e.target.value,
                          })
                        }
                        placeholder="Product name"
                        required
                        disabled={submitting || uploading}
                      />
                      <Textarea
                        value={editingProduct.description || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            description: e.target.value,
                          })
                        }
                        placeholder="Description"
                        rows={3}
                        disabled={submitting || uploading}
                      />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editingProduct.price}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="Price"
                          required
                          disabled={submitting || uploading}
                        />
                        <Select
                          value={editingProduct.category || ""}
                          onValueChange={(value: string) =>
                            setEditingProduct({
                              ...editingProduct,
                              category: value,
                            })
                          }
                          disabled={submitting || uploading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="protein">Protein</SelectItem>
                            <SelectItem value="supplements">
                              Supplements
                            </SelectItem>
                            <SelectItem value="pre-workout">
                              Pre-Workout
                            </SelectItem>
                            <SelectItem value="amino acids">
                              Amino Acids
                            </SelectItem>
                            <SelectItem value="vitamins">Vitamins</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          type="number"
                          min="0"
                          value={editingProduct.weight || ""}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              weight: parseInt(e.target.value) || null,
                            })
                          }
                          placeholder="Weight (g)"
                          disabled={submitting || uploading}
                        />
                        <Input
                          type="number"
                          min="0"
                          value={editingProduct.stock || ""}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              stock: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="Stock"
                          disabled={submitting || uploading}
                        />
                      </div>

                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageFileChange}
                          className="mb-2"
                          disabled={submitting || uploading}
                        />
                        {editImagePreview && (
                          <img
                            src={editImagePreview}
                            alt="New image preview"
                            className="h-20 w-20 object-cover rounded mb-2"
                          />
                        )}
                        {getProductImage(editingProduct) &&
                          !editImagePreview && (
                            <Image
                              src={getProductImage(editingProduct)!}
                              alt="Current product image"
                              width={80}
                              height={80}
                              className="h-20 w-20 object-cover rounded"
                              unoptimized
                            />
                          )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={submitting || uploading}
                          className="flex-1"
                        >
                          {submitting ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {uploading ? "Uploading..." : "Saving..."}
                            </div>
                          ) : (
                            "Save"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingProduct(null);
                            setEditingProductImage(null);
                            setEditImagePreview("");
                          }}
                          className="flex-1"
                          disabled={submitting || uploading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {getProductImage(product) ? (
                          <Image
                            src={getProductImage(product)!}
                            alt={product.name}
                            width={400}
                            height={400}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            unoptimized
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove(
                                "hidden"
                              );
                            }}
                          />
                        ) : null}
                        <div
                          className={`${
                            getProductImage(product) ? "hidden" : ""
                          } h-full flex items-center justify-center text-gray-400`}
                        >
                          <div className="text-center">
                            <svg
                              className="h-16 w-16 mx-auto mb-2"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                            </svg>
                            <p className="text-sm">No image</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white truncate">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="mt-3 grid grid-cols-2 gap-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                          <div>
                            <span className="font-medium">Category:</span>{" "}
                            <span className="capitalize">
                              {product.category}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Weight:</span>{" "}
                            {product.weight ? `${product.weight}g` : "N/A"}
                          </div>
                          <div>
                            <span className="font-medium">Stock:</span>{" "}
                            <span
                              className={
                                (product.stock || 0) <= 0
                                  ? "text-red-500"
                                  : "text-green-600"
                              }
                            >
                              {(product.stock || 0) <= 0
                                ? "Out"
                                : `${product.stock} units`}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-lg font-bold text-neutral-800 dark:text-white">
                            ${product.price.toFixed(2)}
                          </span>
                          {(product.stock || 0) > 0 &&
                            (product.stock || 0) <= 10 && (
                              <span className="text-xs text-orange-500 font-medium">
                                Only {product.stock} left!
                              </span>
                            )}
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingProduct(product)}
                            disabled={submitting || uploading}
                            className="flex-1"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleDeleteProduct(product.id, product.name)
                            }
                            disabled={submitting || uploading}
                            className="flex-1"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
