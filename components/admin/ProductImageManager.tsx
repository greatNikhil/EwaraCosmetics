"use client";

import { useState } from "react";
import { uploadProductImages } from "@/utils/productApi";

type ProductImageManagerProps = {
  value: string;
  onChange: (value: string) => void;
  token: string | null;
  disabled?: boolean;
};

const parseImageLines = (value: string) =>
  value
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);

export default function ProductImageManager({
  value,
  onChange,
  token,
  disabled = false,
}: ProductImageManagerProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const imageList = parseImageLines(value);

  const updateImageList = (nextImages: string[]) => {
    onChange(nextImages.join("\n"));
  };

  const handleUpload = async () => {
    if (!token) {
      alert("Please login again before uploading images.");
      return;
    }

    if (selectedFiles.length === 0) {
      alert("Please choose at least one image first.");
      return;
    }

    try {
      setUploading(true);
      const response = await uploadProductImages(selectedFiles, token);
      const uploadedImages = Array.isArray(response.images)
        ? response.images.filter(Boolean)
        : [];

      if (uploadedImages.length === 0) {
        alert("Upload completed but no image path was returned.");
        return;
      }

      updateImageList([...imageList, ...uploadedImages]);
      setSelectedFiles([]);
    } catch (error: any) {
      console.error("Product image upload failed:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to upload product image. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    updateImageList(imageList.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-dashed border-[#d9b8c1] bg-[#fff8f6] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <label className="block flex-1">
            <span className="text-sm font-medium text-[#4a2c2a]">
              Upload Product Images
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={disabled || uploading}
              onChange={(event) =>
                setSelectedFiles(Array.from(event.target.files || []))
              }
              className="mt-2 w-full rounded-2xl border border-[#ead2d8] bg-white px-4 py-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-[#7a1f2b] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white focus:border-[#7a1f2b]"
            />
          </label>

          <button
            type="button"
            onClick={handleUpload}
            disabled={disabled || uploading || selectedFiles.length === 0}
            className="rounded-full bg-[#7a1f2b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8f2e47] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        <p className="mt-2 text-xs text-[#6b7280]">
          JPG, PNG, or WEBP only. Max 8 images per upload, 8 MB each. Uploaded
          paths are added below automatically.
        </p>
        {selectedFiles.length > 0 && (
          <p className="mt-2 text-xs font-medium text-[#7a1f2b]">
            {selectedFiles.length} image{selectedFiles.length === 1 ? "" : "s"} selected
          </p>
        )}
      </div>

      <label className="block">
        <span className="text-sm font-medium text-[#4a2c2a]">
          Images (one URL/path per line) *
        </span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          placeholder="/uploads/products/product-1.webp&#10;/Product/old-product-image.jpg"
          className="mt-2 w-full rounded-2xl border border-[#ead2d8] bg-[#fdf8f6] px-4 py-3 outline-none focus:border-[#7a1f2b]"
        />
        <p className="mt-1 text-xs text-[#6b7280]">
          First image will be used as the main product image. Manual paths still
          work if needed.
        </p>
      </label>

      {imageList.length > 0 && (
        <div className="block">
          <span className="mb-2 block text-sm font-medium text-[#4a2c2a]">
            Image Preview
          </span>
          <div className="flex flex-wrap gap-2">
            {imageList.map((url, index) => (
              <div key={`${url}-${index}`} className="relative">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="h-16 w-16 rounded-lg border border-[#ead2d8] object-cover"
                  onError={(event) => {
                    event.currentTarget.src = "/favicon/product.jpeg";
                  }}
                />
                {index === 0 && (
                  <span className="absolute -right-2 -top-2 rounded bg-[#7a1f2b] px-1 text-xs text-white">
                    Main
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -bottom-2 -right-2 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#7a1f2b] shadow"
                  aria-label={`Remove image ${index + 1}`}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
