"use client";

import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// Import your images
import familyPhoto from "/public/family-photo.jpg"; // Make sure this image exists
import shopPhoto from "/public/shop.jpg";
import flowersPhoto from "/public/flowers-photo.jpg";

export default function AboutUsPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openImage = (src: string) => {
    setSelectedImage(src);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-5xl font-gotham tracking-wider text-gray-700 mb-12 text-center pb-4">About Us</h1>
      <p className="text-lg text-gray-700 mb-16 text-center max-w-2xl mx-auto">
        We're a family-owned small business catering to our local community.
        Providing the best blooms at honest prices is our passion and commitment.
      </p>

      <div className="space-y-16">
        {/* Section 1 */}
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2">
            <Dialog>
              <DialogTrigger asChild>
                <Image
                  src={familyPhoto}
                  alt="Our Family"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg cursor-pointer"
                  onClick={() => openImage(familyPhoto.src)}
                />
              </DialogTrigger>
              {selectedImage && (
                <DialogContent className="sm:max-w-[90%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] w-full h-full flex justify-center items-center">
                  <div className="relative w-full h-full max-w-[90%] max-h-[90%]">
                    <Image
                      src={selectedImage}
                      alt="Selected Image"
                      layout="fill"
                      objectFit="contain"
                      className="rounded-lg"
                    />
                  </div>
                </DialogContent>
              )}
            </Dialog>
          </div>
          <div className="md:w-1/2 md:pl-12 mt-8 md:mt-0">
            <h2 className="text-3xl font-oSans text-gray-900 mb-4">
              Our Story
            </h2>
            <p className="text-gray-700 mb-4">
              Founded in 1995, our flower shop has been a labor of love for our family. What started as a small garden in our backyard blossomed into a full-fledged business that brings joy to our community. We believe in the power of flowers to brighten days, celebrate milestones, and express emotions when words fall short.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="flex flex-col md:flex-row-reverse items-center">
          <div className="md:w-1/2">
            <Dialog>
              <DialogTrigger asChild>
                <Image
                  src={shopPhoto}
                  alt="Our Shop"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg cursor-pointer"
                  onClick={() => openImage(shopPhoto.src)}
                />
              </DialogTrigger>
              {selectedImage && (
                <DialogContent className="sm:max-w-[90%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] w-full h-full flex justify-center items-center">
                  <div className="relative w-full h-full max-w-[90%] max-h-[90%]">
                    <Image
                      src={selectedImage}
                      alt="Selected Image"
                      layout="fill"
                      objectFit="contain"
                      className="rounded-lg"
                    />
                  </div>
                </DialogContent>
              )}
            </Dialog>
          </div>
          <div className="md:w-1/2 md:pr-12 mt-8 md:mt-0">
            <h2 className="text-3xl font-oSans text-gray-900 mb-4">
              Our Commitment
            </h2>
            <p className="text-gray-700 mb-4">
              We are dedicated to offering high-quality flowers and exceptional customer service. By sourcing our blooms locally and seasonally whenever possible, we ensure freshness and support other local businesses. Our honest pricing reflects our belief that everyone should be able to enjoy the beauty of flowers without breaking the bank.
            </p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2">
            <Dialog>
              <DialogTrigger asChild>
                <Image
                  src={flowersPhoto}
                  alt="Our Flowers"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg cursor-pointer"
                  onClick={() => openImage(flowersPhoto.src)}
                />
              </DialogTrigger>
              {selectedImage && (
                <DialogContent className="sm:max-w-[90%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] w-full h-full flex justify-center items-center">
                  <div className="relative w-full h-full max-w-[90%] max-h-[90%]">
                    <Image
                      src={selectedImage}
                      alt="Selected Image"
                      layout="fill"
                      objectFit="contain"
                      className="rounded-lg"
                    />
                  </div>
                </DialogContent>
              )}
            </Dialog>
          </div>
          <div className="md:w-1/2 md:pl-12 mt-8 md:mt-0">
            <h2 className="text-3xl font-oSans text-gray-900 mb-4">
              Our Community
            </h2>
            <p className="text-gray-700 mb-4">
              Being a part of this community means everything to us. We cherish the relationships we've built over the years and are grateful for the trust our customers place in us. From community events to charity drives, we strive to give back and make a positive impact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
