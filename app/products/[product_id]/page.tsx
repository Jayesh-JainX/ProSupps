"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Nav } from "@/components/nav";
import { supabase } from "@/lib/supabase";
import AOS from "aos";
import "aos/dist/aos.css";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Product {
  id: string;
  name: string;
  description: string | null;
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
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
    fetchProduct();
  }, []);

  async function fetchProduct() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.product_id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setError("Product not found");
        } else {
          throw error;
        }
        return;
      }

      // Transform data to ensure proper types
      const transformedProduct = {
        ...data,
        images: data.images || (data.image_url ? [data.image_url] : []),
        specifications: data.specifications || {},
        category: data.category || "uncategorized",
        flavor: data.flavor || "unflavored",
        weight: data.weight || 0,
        stock: data.stock || 0,
        description:
          data.description || "No description available for this product.",
      };

      setProduct(transformedProduct);
    } catch (error: any) {
      console.error("Error fetching product:", error);
      setError(error.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock <= 0) {
      return {
        text: "Out of Stock",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
    } else if (stock <= 10) {
      return {
        text: `Only ${stock} left`,
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      };
    } else {
      return {
        text: `${stock} in stock`,
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      };
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      protein: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      supplements:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "pre-workout":
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "amino acids":
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      vitamins:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[category] || colors.other;
  };

  const getCurrentImage = () => {
    if (product?.images && product.images.length > 0) {
      return product.images[selectedImageIndex] || product.images[0];
    }
    return product?.image_url || null;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              Loading product...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-red-500 mb-6">
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
              <h2 className="text-2xl font-bold mb-2">
                {error || "Product not found"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The product you're looking for doesn't exist or has been
                removed.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={fetchProduct} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => router.push("/products")}>
                Browse Products
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock);
  const currentImage = getCurrentImage();

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link
                  href="/"
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-400 dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3 mr-2.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                  </svg>
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="w-3 h-3 text-gray-400 mx-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <Link
                    href="/products"
                    className="ml-1 text-sm font-medium text-gray-700 hover:text-primary md:ml-2 dark:text-gray-400 dark:hover:text-white"
                  >
                    Products
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg
                    className="w-3 h-3 text-gray-400 mx-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400 truncate max-w-[200px]">
                    {product.name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Product Images */}
            <div data-aos="fade-right" className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-xl shadow-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {currentImage && !imageError ? (
                  <Image
                    src={currentImage}
                    alt={product.name}
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    fill
                    priority
                    unoptimized
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <svg
                        className="h-24 w-24 mx-auto mb-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                      </svg>
                      <p className="text-lg font-medium">No image available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setImageError(false);
                      }}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-primary shadow-md"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="object-cover"
                        fill
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div data-aos="fade-left" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {product.name}
                  </h1>
                  <Badge className={getCategoryColor(product.category)}>
                    {product.category.charAt(0).toUpperCase() +
                      product.category.slice(1)}
                  </Badge>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </div>
                  <Badge className={stockStatus.color}>
                    {stockStatus.text}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Product Description */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Description
                </h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Product Details */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Product Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Weight
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {product.weight > 0
                        ? `${product.weight}g`
                        : "Not specified"}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Flavor
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white capitalize">
                      {product.flavor}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Category
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white capitalize">
                      {product.category}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Availability
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              {Object.keys(product.specifications).length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Specifications
                    </h2>
                    <div className="space-y-3">
                      {Object.entries(product.specifications).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                          >
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {key}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {value}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Contact/Purchase Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Get This Product
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Interested in this product? Contact us for pricing,
                  availability, and ordering information.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={
                      process.env.NEXT_PUBLIC_TELEGRAM_LINK ||
                      "https://t.me/prosupps_official"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={product.stock <= 0}
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                      {product.stock <= 0
                        ? "Out of Stock"
                        : "Contact on Telegram"}
                    </Button>
                  </Link>
                  <Link href="/contact" className="flex-1">
                    <Button variant="outline" className="w-full" size="lg">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Product Meta Information */}
              <div className="text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p>Product ID: p-{product.id.substring(0, 8)}</p>
                <p>
                  Last updated:{" "}
                  {new Date(product.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
