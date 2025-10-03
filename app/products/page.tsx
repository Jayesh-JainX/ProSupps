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
  image_url: string | null;
  images: string[];
  category: string;
  weight: number;
  flavor: string;
  stock: number;
  specifications: Record<string, string>;
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
        setError("No products available at the moment.");
        setProducts([]);
        return;
      }

      // Transform data to ensure arrays exist
      const transformedData = data.map((product) => ({
        ...product,
        images:
          product.images || (product.image_url ? [product.image_url] : []),
        specifications: product.specifications || {},
        category: product.category || "uncategorized",
        flavor: product.flavor || "unflavored",
        weight: product.weight || 0,
        stock: product.stock || 0,
      }));

      setProducts(transformedData);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("An unexpected error occurred. Please try again later.");
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
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product.image_url) {
      return product.image_url;
    }
    return null;
  };

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
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-96 items-center justify-center">
              <div className="text-center">
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
                    {category !== "all"
                      ? `No products in the "${category}" category`
                      : "No products available at the moment"}
                  </p>
                </div>
                {category !== "all" && (
                  <Button onClick={() => setCategory("all")} variant="outline">
                    View All Products
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  data-aos="fade-up"
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:shadow-neutral-700"
                >
                  {/* Stock indicator */}
                  {product.stock <= 0 && (
                    <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                      Out of Stock
                    </div>
                  )}

                  {/* Main clickable product area */}
                  <Link href={`/products/${product.id}`} className="flex-1">
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
                          <span className="capitalize">{product.category}</span>
                        </div>
                        <div>
                          <span className="font-medium">Weight:</span>{" "}
                          {product.weight}g
                        </div>
                        <div>
                          <span className="font-medium">Flavor:</span>{" "}
                          <span className="capitalize">{product.flavor}</span>
                        </div>
                        <div>
                          <span className="font-medium">Stock:</span>{" "}
                          <span
                            className={
                              product.stock <= 0
                                ? "text-red-500"
                                : "text-green-600"
                            }
                          >
                            {product.stock <= 0
                              ? "Out"
                              : `${product.stock} units`}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-lg font-bold text-neutral-800 dark:text-white">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.stock > 0 && product.stock <= 10 && (
                          <span className="text-xs text-orange-500 font-medium">
                            Only {product.stock} left!
                          </span>
                        )}
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
                      <Button
                        className="w-full"
                        disabled={product.stock <= 0}
                        variant={product.stock <= 0 ? "secondary" : "default"}
                      >
                        {product.stock <= 0 ? "Out of Stock" : "Contact Us"}
                      </Button>
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
