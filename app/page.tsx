"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  return (
    <div className=" flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32 lg:pb-32 xl:pb-36">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              <div data-aos="fade-right" className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Premium Whey Protein
                    <br />
                    For Peak Performance
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Fuel your workouts with our premium whey protein. Made with the finest ingredients
                    for optimal muscle recovery and growth.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/products">
                    <Button size="lg" className="w-full min-[400px]:w-auto">
                      View Products
                    </Button>
                  </Link>
                  <Link href={process.env.NEXT_PUBLIC_TELEGRAM_LINK || "https://t.me/prosupps_official"}>
                    <Button variant="outline" size="lg" className="w-full min-[400px]:w-auto">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
              <div data-aos="fade-left" className="mx-auto flex items-center justify-center lg:justify-end">
                <Image
                  src="/whey_prot.jpg"
                  alt="Whey Protein Product"
                  width={500}
                  height={500}
                  className="rounded-lg object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-neutral-50 dark:bg-neutral-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 data-aos="fade-up" className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Why Choose Our Protein?
                </h2>
                <p data-aos="fade-up" className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our whey protein is designed to provide you with the highest quality nutrition for your fitness journey.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="flex flex-col items-center space-y-4 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Benefits Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 data-aos="fade-up" className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Benefits of Our Protein
              </h2>
              <p data-aos="fade-up" className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Experience the difference with our premium whey protein supplements.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="rounded-lg border p-6 bg-white dark:bg-neutral-950 shadow-sm"
                >
                  <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-neutral-50 dark:bg-neutral-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 data-aos="fade-up" className="text-3xl font-bold tracking-tighter sm:text-5xl">
                What Our Customers Say
              </h2>
              <p data-aos="fade-up" className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Don't just take our word for it - hear from our satisfied customers.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="rounded-lg border p-6 bg-white dark:bg-neutral-950"
                >
                  <p className="mb-4 text-sm italic text-gray-500 dark:text-gray-400">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800" />
                    <div>
                      <p className="text-sm font-medium">{testimonial.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 data-aos="fade-up" className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Ready to Start Your Fitness Journey?
              </h2>
              <p data-aos="fade-up" className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                Join thousands of satisfied customers who have transformed their fitness with our premium whey protein.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/products">
                  <Button size="lg" className="w-full min-[400px]:w-auto">
                    Shop Now
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="w-full min-[400px]:w-auto">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const benefits = [
  {
    title: "Muscle Growth",
    description: "Supports lean muscle growth and maintenance with high-quality protein."
  },
  {
    title: "Quick Recovery",
    description: "Speeds up post-workout recovery and reduces muscle soreness."
  },
  {
    title: "Easy Digestion",
    description: "Easily digestible formula that's gentle on your stomach."
  },
  {
    title: "Immune Support",
    description: "Contains essential nutrients that support immune system function."
  },
  {
    title: "Energy Boost",
    description: "Provides sustained energy for better workout performance."
  },
  {
    title: "Weight Management",
    description: "Helps maintain healthy weight by supporting lean muscle mass."
  }
];

const testimonials = [
  {
    text: "I've tried many protein supplements, but this is by far the best. Great taste and amazing results!",
    name: "John D.",
    title: "Fitness Enthusiast"
  },
  {
    text: "The quality is outstanding. I've seen significant improvements in my recovery time.",
    name: "Sarah M.",
    title: "Personal Trainer"
  },
  {
    text: "Delicious flavors and mixes perfectly. It's now an essential part of my daily routine.",
    name: "Mike R.",
    title: "Amateur Athlete"
  }
];

const features = [
  {
    title: "High Quality Ingredients",
    description: "Made with premium whey protein isolate for maximum protein content and minimal fats.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "Fast Absorption",
    description: "Specially formulated for quick absorption and rapid muscle recovery after workouts.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    title: "Great Taste",
    description: "Available in multiple delicious flavors that you'll love to drink every day.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];
