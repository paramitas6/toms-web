import Image from "next/image";
import { Clock, MapPin, Phone, Mail, Instagram } from "lucide-react";

const EventsAndContact = () => {
  return (
    <>
      {/* Decorate Your Moments Section */}
      <div className="min-h-[60vh] flex flex-col bg-gray-50 items-center py-8">
        <h1 className="text-4xl md:text-5xl font-oSans text-gray-700 mb-12 tracking-wider text-center">
          Decorate your moments
        </h1>

        <div className="flex flex-col md:flex-row md:w-2/3 w-full bg-white overflow-hidden h-[600px] sm:h-[70vh]">
          {/* Image Section */}
          <div className="relative w-full md:w-1/2 h-[500px]  md:h-auto ">
            <Image
              src="/event-decor.jpg"
              alt="Event Decoration"
              layout="fill"
              objectFit="cover"
              priority
            />
          </div>

          {/* Text Section */}
          <div className="flex flex-col justify-center items-center text-center md:items-start text-lg font-montserrat text-gray-500 p-6 md:p-8 w-full md:w-1/2">
            <div className="flex flex-col m-2 md:text-center space-y-3 ">
              <span>From weddings of wonder to a unique magical night</span>

              <span>Engagements that sparkle and graduations in sight</span>

              <span>We put our heart in each floral delight</span>

              <span>For the beautiful memories where you shine bright</span>
            </div>
          </div>
        </div>

        <a
          href="/services"
          className="mt-6 text-blue-600 hover:underline text-lg font-montserrat"
        >
          Learn more
        </a>
      </div>

      {/* Visit Us Section */}

      <div className="min-h-[60vh] flex flex-col bg-white items-center  py-8 ">
        <h1 className="text-4xl md:text-5xl font-oSans text-gray-700 mb-12 tracking-wider text-center">
          Come hang out with us
        </h1>
        <div
          className="relative flex w-full h-[70vh] bg-fixed bg-center bg-cover overflow-hidden justify-center items-center"
          style={{ backgroundImage: `url('/shop-photo.jpg')` }}
        >
          {/* Overlay Div */}

          <div className="flex flex-col md:flex-row md:w-2/3 w-full overflow-hidden h-[600px] sm:h-[50vh]">

            <div className="bg-white bg-opacity-80  p-6 md:p-8 md:w-1/2 h-full flex flex-col  justify-around items-center">
              {/* Location */}
              <div className="flex flex-col items-center mb-6 md:mb-0">
                <MapPin className="w-8 h-8 text-gray-900 mb-2" />

                <a
                  href="https://www.google.com/maps/place/Tom%E2%80%99s+Florist"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-center md:text-left"
                >
                  572 Eglinton Ave W, Toronto, ON M5N 1B7
                </a>
              </div>

              {/* Opening Hours */}
              <div className="flex flex-col items-center mb-6 md:mb-0">
                <Clock className="w-8 h-8 text-gray-700 mb-2" />

                <ul className="text-gray-500 text-center md:text-left">
                  <li>Monday ~ Sunday: 9 AM - 6 PM</li>
                </ul>
              </div>

              {/* Contact Phone */}
              <div className="flex flex-col  items-center mb-6 md:mb-0">
                <Phone className="w-6 h-6 text-gray-700 mb-2" />
                <a
                  href="tel:+16473529188"
                  className="text-blue-600 hover:underline text-center md:text-left"
                >
                  (647) 352-9188
                </a>
              </div>

              {/* Contact Email */}
              <div className="flex flex-col items-center">
                <Mail className="w-6 h-6 text-gray-700 mb-2" />
                <a
                  href="mailto:tomsflorist@gmail.com"
                  className="text-blue-600 hover:underline text-center md:text-left"
                >
                  tomsflorist@gmail.com
                </a>
              </div>

              {/* Instagram Handle */}
              <div className="flex flex-col items-center">
                <Instagram className="w-6 h-6 text-gray-700 mb-2" />
                <a
                  href="https://www.instagram.com/tomsflorist"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-center md:text-left"
                >
                  @tomsflorist
                </a>
              </div>
            </div>
            <div className="relative flex justify-center items-center bg-black bg-opacity-30 sm:w-1/2 h-full">
              <Image
                src="/map.png"
                alt="Shop Photo"
                width={500}
                height={400}
                objectFit="cover"
                className=""
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventsAndContact;
