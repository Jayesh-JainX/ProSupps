"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/nav";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/supabase";
import AOS from "aos";
import "aos/dist/aos.css";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Product = Database["public"]["Tables"]["products"]["Row"];

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    weight: '',
    flavor: '',
    stock: '',
    image_url: ''
  });
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [editingProductImage, setEditingProductImage] = useState<File | null>(null);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
    checkAdmin();
    fetchProducts();
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      router.push('/');
      return;
    }

    setIsAdmin(true);
  }

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  async function handleProductImageUpload(file: File, productId: string) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading product image:', error);
      throw error;
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('products').insert([{
        ...newProduct,
        price: parseFloat(newProduct.price),
        weight: parseInt(newProduct.weight),
        stock: parseInt(newProduct.stock)
      }]).select().single();

      if (error) throw error;

      if (newProductImage && data) {
        const imageUrl = await handleProductImageUpload(newProductImage, data.id);
        await supabase
          .from('products')
          .update({ image_url: imageUrl })
          .eq('id', data.id);
      }

      fetchProducts();
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        weight: '',
        flavor: '',
        stock: '',
        image_url: ''
      });
      setNewProductImage(null);
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Failed to add product');
    }
  }

  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      let imageUrl = editingProduct.image_url;

      if (editingProductImage) {
        imageUrl = await handleProductImageUpload(editingProductImage, editingProduct.id);
      }

      const { error } = await supabase
        .from('products')
        .update({
          ...editingProduct,
          price: parseFloat(editingProduct.price.toString()),
          weight: parseInt(editingProduct.weight?.toString() || '0'),
          stock: parseInt(editingProduct.stock?.toString() || '0'),
          image_url: imageUrl
        })
        .eq('id', editingProduct.id);

      if (error) throw error;
      fetchProducts();
      setEditingProduct(null);
      setEditingProductImage(null);
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Failed to update product');
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product');
    }
  }

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div data-aos="fade-up" className="mb-8">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Admin Dashboard</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Manage your products here</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900 dark:text-red-100">
              {error}
            </div>
          )}

          <div data-aos="fade-up" className="mb-8 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
            <h2 className="mb-4 text-xl font-bold">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="grid gap-4 sm:grid-cols-2">
              <Input
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
              />
              <Input
                placeholder="Price"
                type="number"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                required
              />
              <Input
                placeholder="Category"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                required
              />
              <Input
                placeholder="Weight (g)"
                type="number"
                value={newProduct.weight}
                onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })}
                required
              />
              <Input
                placeholder="Flavor"
                value={newProduct.flavor}
                onChange={(e) => setNewProduct({ ...newProduct, flavor: e.target.value })}
                required
              />
              <Input
                placeholder="Stock"
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                required
              />
              <div className="sm:col-span-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewProductImage(e.target.files?.[0] || null)}
                />
              </div>
              <Textarea
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="sm:col-span-2"
                required
              />
              <Button type="submit" className="sm:col-span-2">Add Product</Button>
            </form>
          </div>

          <div data-aos="fade-up" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={product.image_url || '/whey_prot.jpg'}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
                {editingProduct?.id === product.id ? (
                  <form onSubmit={handleUpdateProduct} className="mt-4 space-y-4">
                    <Input
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      required
                    />
                    <Textarea
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      required
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                        required
                      />
                      <Input
                        value={editingProduct.category || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        type="number"
                        value={editingProduct.weight || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, weight: parseInt(e.target.value) })}
                        required
                      />
                      <Input
                        value={editingProduct.flavor || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, flavor: e.target.value })}
                        required
                      />
                    </div>
                    <Input
                      type="number"
                      value={editingProduct.stock || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                      required
                    />
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditingProductImage(e.target.files?.[0] || null)}
                      />
                      {editingProduct.image_url && (
                        <img
                          src={editingProduct.image_url}
                          alt="Current product image"
                          className="mt-2 h-20 w-20 object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Save</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingProduct(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-4 space-y-2">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">${product.price.toFixed(2)}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProduct(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}