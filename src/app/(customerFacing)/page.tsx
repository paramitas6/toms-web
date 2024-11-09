import BgOverlay from "./_components/BgOveray"; // Import the BgOverlay component

import db from "@/db/db";
import { cache } from "@/lib/cache";
import Image from "next/image";
import { Clock, MapPin, Phone, Mail } from "lucide-react"; // Import icons from lucide-react

import React from "react";
import EventsAndContact from "./_components/EventsAndContact";

export default async function Home() {
  // Fetch data server-side
  const [homeSettings] = await Promise.all([getHomeSettings()]);

  const {
    backgroundImage = "/background.jpg",
    overlayText = "LET YOUR HEART BLOOM",
  } = homeSettings || {};
  const FeaturedProducts = React.lazy(
    () => import("./_components/FeaturedProducts")
  );

  return (
    <main className="overflow-x-hidden relative font-oSans">
      {/* BgOverlay Section */}
      <BgOverlay backgroundImage={backgroundImage} overlayText={overlayText} />

      <div className="m-8">
        <div className="text-center">
          <h1 className="text-5xl font-oSans text-gray-700 m-4 tracking-wider">
            Watch your loved ones smile
          </h1>
          <p className="text-lg font-montserrat text-gray-500 mb-8">
            Give the finest flowers from our exquisite collection of flowers.
          </p>
        </div>
      </div>

      {/* Featured Products Section */}
      <FeaturedProducts />
      {/* Events Section */}
      <EventsAndContact />
    </main>
  );
}

// Define server-side caching functions

const getHomeSettings = cache(
  async () => {
    return db.homeSetting.findFirst({
      orderBy: { createdAt: "desc" },
    });
  },
  ["/home", "getHomeSettings"],
  { revalidate: 20 }
);
