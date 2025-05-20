"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Nav } from "@/components/nav";
import { supabase } from "@/lib/supabase";
import AOS from "aos";
import "aos/dist/aos.css";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  specifications: Record<string, string>;
  category: string;
  weight: number;
  flavor: string;
  stock: number;
}

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
    fetchProduct();
  }, []);

  async function fetchProduct() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.product_id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-lg">Loading...</div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-lg text-red-500">
            {error || "Product not found"}
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
          <div className="grid gap-8 md:grid-cols-2">
            <div data-aos="fade-right" className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    className="object-cover"
                    fill
                    priority
                  />
                ) : (
                  <Image
                    src="/whey_prot.jpg"
                    alt={product.name}
                    className="object-cover"
                    fill
                    priority
                  />
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1).map((image, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 2}`}
                        className="object-cover"
                        fill
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div data-aos="fade-left" className="space-y-6">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="text-2xl font-semibold">
                ${product.price.toFixed(2)}
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {product.description}
              </p>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Category</div>
                    <div className="font-medium">{product.category}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Weight</div>
                    <div className="font-medium">{product.weight}g</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Flavor</div>
                    <div className="font-medium">{product.flavor}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Stock</div>
                    <div className="font-medium">{product.stock} units</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Specifications</h2>
                  <div className="grid gap-2">
                    {Object.entries(product.specifications || {}).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="grid grid-cols-2 gap-2 border-b border-gray-200 py-2 dark:border-gray-700"
                        >
                          <div className="font-medium">{key}</div>
                          <div>{value}</div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}