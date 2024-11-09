// src/app/admin/carousel/CarouselManager.tsx

"use client";

import { useState } from "react";
import { addCarouselImage, deleteCarouselImage } from "../_actions/carousel";
import Image from "next/image";

// Define the type for a carousel image
type CarouselImage = {
  id: number;
  imageUrl: string;
  isActive: boolean;
};

// Define the props for CarouselManager
type CarouselManagerProps = {
  initialImages: CarouselImage[];
};

const CarouselManager: React.FC<CarouselManagerProps> = ({ initialImages }) => {
  const [images, setImages] = useState<CarouselImage[]>(initialImages);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [addErrors, setAddErrors] = useState<string[]>([]);
  const [deleteErrors, setDeleteErrors] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle form submission to add a new image
  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddErrors([]);
    setLoading(true);

    if (!selectedFile) {
      setAddErrors(["Please select an image to upload."]);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const result = await addCarouselImage(formData);
      if (result.errors && result.errors.length > 0) {
        setAddErrors(result.errors);
      } else {
        // Refresh the images list by fetching updated images
        const updatedImages = await fetchCarouselImages();
        setImages(updatedImages);
        setSelectedFile(null);
        // Reset the file input
        const imageInput = document.getElementById("imageInput") as HTMLInputElement;
        if (imageInput) imageInput.value = "";
      }
    } catch (error) {
      console.error("Error adding image:", error);
      setAddErrors(["An unexpected error occurred."]);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting an image
  const handleDeleteImage = async (id: number) => {
    setDeleteErrors(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("id", id.toString());

    try {
      const result = await deleteCarouselImage(formData);
      if (result.errors) {
        setDeleteErrors(result.errors);
      } else {
        // Remove the deleted image from the state
        setImages(images.filter((img) => img.id !== id));
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      setDeleteErrors("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch updated carousel images
  const fetchCarouselImages = async (): Promise<CarouselImage[]> => {
    // Fetch the updated images from the server via an API route
    const res = await fetch("/api/carousel/images", { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Failed to fetch carousel images");
    }
    return res.json();
  };

  return (
    <div>
      {/* Add Image Form */}
      <form onSubmit={handleAddImage} className="mb-6">
        <div className="flex items-center">
          <input
            type="file"
            accept="image/*"
            id="imageInput"
            onChange={handleFileChange}
            className="mr-4"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {loading ? "Uploading..." : "Add Image"}
          </button>
        </div>
        {addErrors.length > 0 && (
          <div className="mt-2 text-red-500">
            {addErrors.map((error, idx) => (
              <p key={idx}>{error}</p>
            ))}
          </div>
        )}
      </form>

      {/* Display Carousel Images */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="border p-2 relative">
              <Image
                src={img.imageUrl}
                alt={`Carousel Image ${img.id}`}
                width={300}
                height={200}
                className="object-cover w-full h-48"
              />
              <button
                onClick={() => handleDeleteImage(img.id)}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
                disabled={loading}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No carousel images available.</p>
      )}

      {/* Delete Error */}
      {deleteErrors && (
        <div className="mt-4 text-red-500">
          <p>{deleteErrors}</p>
        </div>
      )}
    </div>
  );
};

export default CarouselManager;
