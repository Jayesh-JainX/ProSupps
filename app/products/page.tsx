"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/nav";
import { supabase } from "@/lib/supabase";
import AOS from "aos";
import "aos/dist/aos.css";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  weight: number;
  flavor: string;
  stock: number;
  specifications: Record<string, string>;
  images: string[];
  created_at: string;
  updated_at: string;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc">("price-asc");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase.from("products").select("*");

      if (error) {
        setError("Failed to load products. Please try again later.");
        throw error;
      }
      if (!data || data.length === 0) {
        setError("No products available at the moment.");
      }
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products
    .filter((product) => category === "all" || product.category === category)
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      return b.price - a.price;
    });

  const categories = [
    "all",
    ...new Set(products.map((p) => p.category || "uncategorized")),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div
            data-aos="fade-up"
            className="flex flex-col items-center justify-between gap-4 md:flex-row"
          >
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Our Products
            </h1>
            <div className="flex gap-4">
              <select
                className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "price-asc" | "price-desc")
                }
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
                >
                  <div className="aspect-square bg-neutral-200 dark:bg-neutral-800" />
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
              <p className="text-center text-red-500">{error}</p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  data-aos="fade-up"
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950 dark:hover:shadow-neutral-700"
                >
                  {/* Main clickable product area */}
                  <Link href={`/products/${product.id}`} className="flex-1">
                    <div className="aspect-square overflow-hidden">
                      <Image
                        src={product.images?.[0] || "/whey_prot.jpg"}
                        alt={product.name}
                        width={400}
                        height={400}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white truncate">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="mt-3 grid grid-cols-1 gap-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                        <div>
                          <span className="font-medium">Category:</span>{" "}
                          {product.category}
                        </div>
                        <div>
                          <span className="font-medium">Weight:</span>{" "}
                          {product.weight}g
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-base font-bold text-neutral-800 dark:text-white">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Contact Us Button */}
                  <div className="p-4 pt-0">
                    <Link
                      href={
                        process.env.NEXT_PUBLIC_TELEGRAM_LINK ||
                        "https://t.me/prosupps_official"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button
                        type="button"
                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        Contact Us
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
