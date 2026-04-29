"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { buildApiUrl } from "@/utils/api";
import { getClientToken } from "@/utils/clientAuth";

interface Address {
  _id?: string;
  name: string;
  lastname?: string;
  address: string;
  phone: string;
  pincode: string;
  flat?: string;
  city: string;
  state: string;
  default?: boolean;
}

interface AddressSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onAddressChange: (address: Address) => void;
}

export default function AddressSelectorModal({
  isOpen,
  onClose,
  user,
  onAddressChange,
}: AddressSelectorModalProps) {
  const router = useRouter();
  const { addresses: savedAddresses, setAddresses } = useAuthStore();

  const [addresses, setLocalAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadAddresses = async () => {
      if (!isOpen || !user) return;

      if (savedAddresses.length > 0) {
        setLocalAddresses(savedAddresses);
        setSelectedAddress(
          savedAddresses.find((addr: Address) => addr.default) ||
            savedAddresses[0] ||
            null
        );
      }

      const token = getClientToken();

      if (!token) {
        return;
      }

      try {
        const res = await fetch(buildApiUrl("/api/addresses"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          return;
        }

        const nextAddresses = data.addresses || [];
        setLocalAddresses(nextAddresses);
        setAddresses(nextAddresses);

        const defaultAddr = nextAddresses.find(
          (addr: Address) => addr.default
        );

        setSelectedAddress(defaultAddr || nextAddresses[0] || null);
      } catch (error) {
        console.error("Failed to load saved addresses:", error);
      }
    };

    loadAddresses();
  }, [isOpen, savedAddresses, setAddresses, user]);

  const handleSaveChanges = async () => {
    if (!selectedAddress || !user) return;

    setIsSaving(true);

    const token = getClientToken();

    if (!token) {
      alert("User information missing.");
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch(
        buildApiUrl(`/api/addresses/${selectedAddress._id}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...selectedAddress,
            default: true,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success || !data.address) {
        alert(data.message || "Failed to select address");
        setIsSaving(false);
        return;
      }

      const updatedUser = {
        ...user,
        address: data.address,
      };

      // ✅ Sync to authStore instead of localStorage
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        default: addr._id === data.address._id
      }));
      setLocalAddresses(updatedAddresses);
      setAddresses(updatedAddresses);
      onAddressChange(data.address);
      window.dispatchEvent(new Event("userChanged"));
      setIsSaving(false);
      onClose();
    } catch (error) {
      console.error("ADDRESS SELECT ERROR:", error);
      alert("Failed to select address");
      setIsSaving(false);
    }
  };

  const handleAddAddress = () => {
    onClose();

    // Yahan apna actual address/profile page route lagao
    // Agar tumhara address form profile page me hai to ye sahi hai:
    router.push("/profile");
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
        <div
          className="animate-in fade-in slide-in-from-bottom-10 md:slide-in-from-center flex max-h-[90vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl md:w-full md:max-w-md md:rounded-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 flex items-center justify-between rounded-t-3xl border-b border-gray-100 bg-white p-6 md:rounded-t-3xl">
            <h2 className="text-xl font-semibold text-gray-900">
              Select Address
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 transition hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="checkout-scroll-area no-scrollbar flex-1 overflow-y-auto p-6">
            {addresses.length === 0 ? (
              <div className="py-12 text-center">
                <p className="mb-4 text-gray-500">No saved address found</p>
                <button
                  onClick={handleAddAddress}
                  className="rounded-lg bg-[#7a1f2b] px-6 py-2 font-medium text-white transition hover:shadow-md"
                >
                  Add Address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address, index) => {
                  const isSelected =
                    selectedAddress?.address === address.address &&
                    selectedAddress?.phone === address.phone &&
                    selectedAddress?.pincode === address.pincode;

                  return (
                    <div
                      key={index}
                      className={`cursor-pointer rounded-xl border-2 p-4 transition ${
                        isSelected
                          ? "border-[#7a1f2b] bg-[#7a1f2b]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                              isSelected
                                ? "border-[#7a1f2b] bg-[#7a1f2b]"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <div className="h-2 w-2 rounded-full bg-white" />
                            )}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <p className="font-semibold text-gray-900">
                              {address.name}
                            </p>
                            {address.default && (
                              <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs text-green-600">
                                Default
                              </span>
                            )}
                          </div>

                          <p className="break-words text-sm text-gray-600">
                            {address.address}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {addresses.length > 0 && (
            <div className="sticky bottom-0 rounded-b-3xl border-t border-gray-100 bg-white p-6 md:rounded-b-3xl">
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-[#7a1f2b] to-[#9d2638] py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-[0_8px_20px_rgba(122,31,43,0.3)] disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
