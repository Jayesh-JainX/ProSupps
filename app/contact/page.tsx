"use client";

import { useEffect } from "react";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import AOS from "aos";
import "aos/dist/aos.css";
import Link from "next/link";

export default function Contact() {
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
          <div data-aos="fade-up" className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Contact Us
            </h1>
            <p className="mt-4 text-gray-500 md:text-xl dark:text-gray-400">
              Have questions about our products? We're here to help!
            </p>
          </div>

          <div
            data-aos="fade-up"
            data-aos-delay="100"
            className="mx-auto mt-16 max-w-lg rounded-lg border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Connect with Us on Telegram</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Join our Telegram channel for quick responses, product updates, and exclusive offers.
              </p>
              <Link
                href={process.env.NEXT_PUBLIC_TELEGRAM_LINK || "https://t.me/prosupps_official"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="mt-4 w-full">
                  Open Telegram Chat
                </Button>
              </Link>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Quick Response Time: Usually within 1-2 hours</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>Secure and Private Communication</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}