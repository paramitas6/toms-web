"use client";

import { useState, useEffect } from "react";
import { addCarouselImage, deleteCarouselImage } from "../_actions/carousel";
import Image from "next/image";

// Define the type for a carousel image
type CarouselImage = {
  id: number;
  imageUrl: string;
  isActive: boolean;
  usedFor: string;
};

// Define the props for CarouselManager
type CarouselManagerProps = {};

// Predefined usedFor options
const usedForOptions = ["services", "shop"]; // Add more as needed

const CarouselManager: React.FC<CarouselManagerProps> = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [groupedImages, setGroupedImages] = useState<{ [key: string]: CarouselImage[] }>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedUsedFor, setSelectedUsedFor] = useState<string>(usedForOptions[0]);
  const [addErrors, setAddErrors] = useState<string[]>([]);
  const [deleteErrors, setDeleteErrors] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle usedFor selection for adding images
  const handleUsedForChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUsedFor(e.target.value);
  };

  // Handle form submission to add a new image
  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddErrors([]);
    setDeleteErrors(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!selectedFile) {
      setAddErrors(["Please select an image to upload."]);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("usedFor", selectedUsedFor);

    try {
      const result = await addCarouselImage(formData);
      if (result.errors && result.errors.length > 0) {
        setAddErrors(result.errors);
      } else {
        // Refresh the images list by fetching updated images
        const updatedImages = await fetchAllCarouselImages();
        setImages(updatedImages);
        setSelectedFile(null);
        setSelectedUsedFor(usedForOptions[0]); // Reset to default
        // Reset the file input
        const imageInput = document.getElementById("imageInput") as HTMLInputElement;
        if (imageInput) imageInput.value = "";
        // Set success message
        setSuccessMessage("Image uploaded successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
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
    setSuccessMessage(null);
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
        // Set success message
        setSuccessMessage("Image deleted successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      setDeleteErrors("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch all carousel images
  const fetchAllCarouselImages = async (): Promise<CarouselImage[]> => {
    const res = await fetch(`/api/carousel/images`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Failed to fetch carousel images");
    }
    return res.json();
  };

  // Group images by usedFor
  const groupImagesByUsedFor = (images: CarouselImage[]) => {
    const groups: { [key: string]: CarouselImage[] } = {};
    images.forEach((image) => {
      if (!groups[image.usedFor]) {
        groups[image.usedFor] = [];
      }
      groups[image.usedFor].push(image);
    });
    setGroupedImages(groups);
  };

  // Fetch all images on component mount
  useEffect(() => {
    const getImages = async () => {
      setLoading(true);
      try {
        const fetchedImages = await fetchAllCarouselImages();
        setImages(fetchedImages);
        groupImagesByUsedFor(fetchedImages);
      } catch (error) {
        console.error("Error fetching images:", error);
        setImages([]);
        setGroupedImages({});
      } finally {
        setLoading(false);
      }
    };
    getImages();
  }, []);

  // Update groupedImages whenever images state changes
  useEffect(() => {
    groupImagesByUsedFor(images);
  }, [images]);

  return (
    <div>
      {/* Add Image Form */}
      <form onSubmit={handleAddImage} className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add New Carousel Image</h2>
        <div className="flex flex-col md:flex-row items-center mb-4">
          <input
            type="file"
            accept="image/*"
            id="imageInput"
            onChange={handleFileChange}
            className="mr-4 mb-4 md:mb-0"
            required
          />
          <select
            value={selectedUsedFor}
            onChange={handleUsedForChange}
            className="border p-2 rounded mr-4 mb-4 md:mb-0"
            required
          >
            {usedForOptions.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded">
          <p>{successMessage}</p>
        </div>
      )}

      {/* Display Carousel Images Grouped by usedFor */}
      <div>
        {Object.keys(groupedImages).length > 0 ? (
          Object.entries(groupedImages).map(([usedFor, imgs]) => (
            <div key={usedFor} className="mb-8">
              <h3 className="text-xl font-bold mb-4">
                {usedFor.charAt(0).toUpperCase() + usedFor.slice(1)}
              </h3>
              {imgs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {imgs.map((img) => (
                    <div key={img.id} className="border p-2 relative">
                      <Image
                        src={img.imageUrl}
                        alt={`Carousel Image ${img.id}`}
                        width={300}
                        height={200}
                        className="object-cover w-full h-48 rounded"
                      />
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No images available for "{usedFor}".</p>
              )}
            </div>
          ))
        ) : (
          <p>No carousel images available.</p>
        )}
      </div>

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
