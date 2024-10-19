"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

// Import your images
import eventDecorationImage from "/public/event-decoration.jpg"; // Ensure this image exists
import subscriptionImage from "/public/subscription.jpg";
import plantDoctorImage from "/public/plant-doctor.jpg"; // Ensure this image exists

export default function ServicesPage() {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    eventArrangement: false,
    subscription: false,
    plantDoctor: false,
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const openImage = (src: string) => {
    setSelectedImage(src);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-5xl font-kuhlenbach text-center pb-4">
        Services We Offer
      </h1>
      <p className="text-lg text-gray-700 mb-16 text-center max-w-2xl mx-auto">
        From transforming events to nurturing your plants, explore our range of
        services designed to bring beauty into your life.
      </p>

      <div className="space-y-16">
        {/* Service Sections */}
        {[
          {
            id: "eventArrangement",
            title: "Event Arrangement Services",
            description:
              "Transform your events into a floral wonderland with our full-service event arrangement services. Whether it's a wedding, corporate event, or private party, our team will ensure that every detail is perfectly executed to create a stunning floral ambiance.",
            moreDescription:
              "Our experienced team handles everything from concept design to installation. We'll work closely with you to create an unforgettable event that leaves a lasting impression on your guests.",
            images: [
              {
                src: eventDecorationImage,
                alt: "Event Arrangement Services",
              },
              // Add more images if available
            ],
            reverse: false,
          },
          {
            id: "subscription",
            title: "Fresh Bloom Subscription",
            description:
              "Experience the joy of fresh flowers delivered straight to your door with our Fresh Bloom Subscription. We use only the freshest blooms, handpicked and arranged just for you.",
            moreDescription:
              "Since we exclusively use freshly received flowers, delivery timing varies depending on when the new blooms arrive. This ensures you receive the most vibrant and long-lasting arrangements possible. Customize your subscription to suit your preferences and enjoy the natural beauty of seasonal flowers.",
            images: [
              { src: subscriptionImage, alt: "Fresh Bloom Subscription" },
              // Add more images if available
            ],
            reverse: true,
          },
          {
            id: "plantDoctor",
            title: "Plant Doctor Services",
            description:
              "Our Plant Doctor services include repotting, fertilizing, pest consulting, and more. Let our experts help your plants thrive and keep them healthy and vibrant.",
            moreDescription:
              "Whether you're dealing with pest issues, need advice on fertilizing, or require professional repotting services, our Plant Doctor is here to help. We offer personalized consultations to diagnose problems and provide effective solutions, ensuring your plants receive the care they deserve.",
            images: [
              { src: plantDoctorImage, alt: "Plant Doctor Services" },
              // Add more images if available
            ],
            reverse: false,
          },
        ].map((service) => (
          <div
            key={service.id}
            className={`flex flex-col md:flex-row ${
              service.reverse ? "md:flex-row-reverse" : ""
            } items-center`}
          >
            <div className="md:w-1/2">
              <Dialog>
                <DialogTrigger asChild>
                  <Image
                    src={service.images[0].src}
                    alt={service.images[0].alt}
                    width={600}
                    height={400}
                    className="rounded-lg shadow-lg cursor-pointer"
                    onClick={() => openImage(service.images[0].src.src)}
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
            <div
              className={`md:w-1/2 ${
                service.reverse ? "md:pr-12" : "md:pl-12"
              } mt-8 md:mt-0`}
            >
              <h2 className="text-3xl font-kuhlenbach text-gray-900 mb-4">
                {service.title}
              </h2>
              <p className="text-gray-700 mb-4">{service.description}</p>
              <Button
                onClick={() => toggleSection(service.id)}
                variant="ghost"
                className="mt-4 flex items-center text-gray-900 hover:text-gray-700"
              >
                {openSections[service.id] ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Learn More
                  </>
                )}
              </Button>
              <div
                className={`mt-4 overflow-hidden transition-all duration-500 ease-in-out ${
                  openSections[service.id]
                    ? "max-h-[1000px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                {openSections[service.id] && (
                  <div className="pt-4">
                    <h3 className="text-xl font-kuhlenbach text-gray-900 mb-4">
                      More about {service.title}
                    </h3>
                    <p className="text-gray-700 mb-4">
                      {service.moreDescription}
                    </p>
                    {/* Additional Images */}
                    {service.images.length > 1 && (
                      <div className="grid grid-cols-2 gap-4">
                        {service.images.slice(1).map((image) => (
                          <Dialog key={image.src.src}>
                            <DialogTrigger asChild>
                              <Image
                                src={image.src}
                                alt={image.alt}
                                width={300}
                                height={200}
                                className="rounded-lg shadow-lg cursor-pointer"
                                onClick={() => openImage(image.src.src)}
                              />
                            </DialogTrigger>
                            {selectedImage === image.src.src && (
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
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
