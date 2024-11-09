
import React from "react";

interface BgOverlayProps {
  backgroundImage: string;
  overlayText: string;
}

const BgOverlay: React.FC<BgOverlayProps> = ({ backgroundImage, overlayText }) => {
  return (
    <section
      className="relative w-full h-[50vh] bg-fixed bg-center bg-cover"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      {/* Overlay Div */}
      <div className="absolute inset-0 bg-white bg-opacity-10 flex items-center justify-center">
        {/* Text Overlay */}
        <div className="p-8 fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-white font-gotham font-semibold text-center tracking-wider">
            {overlayText}
          </h2>
        </div>
      </div>
    </section>
  );
};

export default BgOverlay;


