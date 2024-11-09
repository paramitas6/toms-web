// src/app/admin/settings/home/page.tsx
"use client";

import React, { useEffect, useState, FormEvent } from "react";

interface HomeSettings {
  backgroundImage: string;
  overlayText: string;
}

const AdminHomeSettings: React.FC = () => {
  const [settings, setSettings] = useState<HomeSettings>({
    backgroundImage: "",
    overlayText: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings/home");
        if (response.ok) {
          const data: HomeSettings = await response.json();
          setSettings(data);
          setPreviewImage(data.backgroundImage);
        } else {
          setError("Failed to fetch home settings.");
        }
      } catch (err) {
        setError("An error occurred while fetching settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview the selected image
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("overlayText", settings.overlayText);
      const imageInput = document.getElementById("backgroundImage") as HTMLInputElement;
      if (imageInput.files?.[0]) {
        formData.append("backgroundImage", imageInput.files[0]);
      }

      const response = await fetch("/api/admin/settings/home", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Settings updated successfully.");
        // Optionally, refresh the settings
        const updatedSettings = await fetch("/api/admin/settings/home").then((res) =>
          res.json()
        );
        setSettings(updatedSettings);
        setPreviewImage(updatedSettings.backgroundImage);
      } else {
        setError(result.error || "Failed to update settings.");
      }
    } catch (err) {
      setError("An error occurred while updating settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Home Settings</h1>
      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Background Image Upload */}
        <div>
          <label htmlFor="backgroundImage" className="block text-sm font-medium text-gray-700">
            Background Image
          </label>
          <input
            type="file"
            id="backgroundImage"
            name="backgroundImage"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full"
          />
          {previewImage && (
            <img
              src={previewImage}
              alt="Background Preview"
              className="mt-2 w-full h-48 object-cover rounded-md"
            />
          )}
        </div>

        {/* Overlay Text */}
        <div>
          <label htmlFor="overlayText" className="block text-sm font-medium text-gray-700">
            Overlay Text
          </label>
          <textarea
            id="overlayText"
            name="overlayText"
            value={settings.overlayText}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="LET YOUR HEART BLOOM"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminHomeSettings;
