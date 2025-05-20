"use client";

import { useEffect } from "react";
import { Nav } from "@/components/nav";
import AOS from "aos";
import "aos/dist/aos.css";

export default function About() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div data-aos="fade-up" className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              About ProSupps
            </h1>
            <p className="mt-4 text-gray-500 md:text-xl dark:text-gray-400">
              Dedicated to delivering premium quality whey protein supplements for your fitness journey.
            </p>
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            <div data-aos="fade-up" data-aos-delay="100" className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
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
              </div>
              <h3 className="text-xl font-bold">Our Mission</h3>
              <p className="text-gray-500 dark:text-gray-400">
                To provide the highest quality protein supplements that help our customers achieve their fitness goals and maintain a healthy lifestyle.
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="200" className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
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
              </div>
              <h3 className="text-xl font-bold">Quality Commitment</h3>
              <p className="text-gray-500 dark:text-gray-400">
                We source only the finest ingredients and maintain strict quality control throughout our manufacturing process to ensure product excellence.
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="300" className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Customer Focus</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Your success is our success. We're dedicated to supporting your fitness journey with expert advice and premium products.
              </p>
            </div>
          </div>

          <div data-aos="fade-up" className="mx-auto mt-16 max-w-3xl rounded-lg bg-neutral-50 p-8 dark:bg-neutral-900">
            <h2 className="text-2xl font-bold">Our Story</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Founded by fitness enthusiasts, ProSupps began with a simple mission: to create the highest quality whey protein supplements that deliver real results. We understand the importance of proper nutrition in achieving fitness goals, which is why we've dedicated ourselves to developing products that meet the highest standards of quality and effectiveness.
            </p>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Today, we continue to innovate and improve our products, working closely with nutrition experts and athletes to ensure we're delivering the best possible supplements to our customers. Our commitment to quality and customer satisfaction remains at the heart of everything we do.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}