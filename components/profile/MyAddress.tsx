"use client";

import { ChevronRight } from "lucide-react";

type MyAddressProps = {
  showForm: boolean;
  setShowForm: any;
  user: any;
  showGuestPopup: (message?: string) => void;
  addresses: any[];
  sortedAddresses: any[];
  openMenu: number | null;
  setOpenMenu: any;
  setForm: any;
  form: any;
  errors: any;
  setErrors: any;
  setEditIndex: any;
  deleteAddress: (index: number) => void;
  saveAddress: () => void;
};

export default function MyAddress({
  showForm,
  setShowForm,
  user,
  showGuestPopup,
  addresses,
  sortedAddresses,
  openMenu,
  setOpenMenu,
  setForm,
  form,
  errors,
  setErrors,
  setEditIndex,
  deleteAddress,
  saveAddress,
}: MyAddressProps) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        {showForm && (
          <button
            type="button"
            className="rounded-full border border-[#f0dde2] p-1 text-[#7B2D42]"
            onClick={() => {
              setShowForm(false);
              setEditIndex(null);
              setErrors({});
              setForm({
                name: "",
                lastname: "",
                address: "",
                phone: "",
                pincode: "",
                flat: "",
                city: "",
                state: "",
                default: false,
              });
            }}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
        )}

        <h2 className="text-[20px] font-medium text-[#2f1f25]">
          {showForm ? "Add New Address" : "My Address"}
        </h2>
      </div>

      {addresses.length === 0 && !showForm && (
        <div className="rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] p-5 text-center">
          <p className="text-base font-medium text-[#2f1f25]">
            No addresses found
          </p>
          <button
            onClick={() => {
              if (!user) {
                showGuestPopup();
                return;
              }
              setShowForm(true);
            }}
            className="mt-4 inline-flex rounded-[10px] border border-dashed border-[#c0a8b0] px-5 py-3 text-sm text-[#7B2D42]"
          >
            + Add New Address
          </button>
        </div>
      )}

      {addresses.length > 0 && !showForm && (
        <div className="space-y-4">
          {sortedAddresses.map((item, index) => (
            <div
              key={index}
              className="rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] px-4 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm text-[#6f5b63]">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[#2f1f25]">
                      {item.name} {item.lastname || ""}
                    </p>
                    {item.default && (
                      <span className="rounded-full bg-[#f5e8eb] px-2.5 py-1 text-[11px] text-[#7B2D42]">
                        Default
                      </span>
                    )}
                  </div>
                  {item.flat && <p className="mt-2">{item.flat}</p>}
                  <p className={item.flat ? "" : "mt-2"}>{item.address}</p>
                  <p>
                    {item.city}, {item.state} {item.pincode}
                  </p>
                  <p className="mt-2">{item.phone}</p>
                </div>
                <div className="relative">
                  <img
                    src="/favicon/dots.svg"
                    className="h-5 w-5 cursor-pointer"
                    onClick={() => setOpenMenu(openMenu === index ? null : index)}
                  />

                  {openMenu === index && (
                    <div className="absolute right-0 z-10 mt-2 w-32 overflow-hidden rounded-lg border border-[#f0dde2] bg-white shadow-md">
                      <div
                        onClick={() => {
                          const selected = sortedAddresses[index];

                          setForm({
                            name: selected.name || "",
                            lastname: selected.lastname || "",
                            address: selected.address || "",
                            phone: selected.phone || "",
                            pincode: selected.pincode || "",
                            flat: selected.flat || "",
                            city: selected.city || "",
                            state: selected.state || "",
                            default: selected.default || false,
                          });

                          const actualIndex = addresses.findIndex(
                            (addr) =>
                              (selected._id && addr._id === selected._id) ||
                              (!selected._id &&
                                addr.address === selected.address &&
                                addr.phone === selected.phone &&
                                addr.pincode === selected.pincode)
                          );

                          setEditIndex(actualIndex);
                          setShowForm(true);
                          setOpenMenu(null);
                        }}
                        className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-[#56444b] hover:bg-[#fdf6f7]"
                      >
                        <img src="/favicon/edit.svg" className="h-5 w-5" />
                        <span>Edit</span>
                      </div>

                      <div
                        onClick={() => {
                          const selected = sortedAddresses[index];
                          const actualIndex = addresses.findIndex(
                            (addr) =>
                              (selected._id && addr._id === selected._id) ||
                              (!selected._id &&
                                addr.address === selected.address &&
                                addr.phone === selected.phone &&
                                addr.pincode === selected.pincode)
                          );
                          deleteAddress(actualIndex);
                          setOpenMenu(null);
                        }}
                        className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-[#b04040] hover:bg-[#fff6f6]"
                      >
                        <img
                          src="/favicon/delete.svg"
                          className="h-5 w-5 scale-110"
                        />
                        <span>Delete</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              if (!user) {
                showGuestPopup();
                return;
              }
              setShowForm(true);
              setEditIndex(null);
              setErrors({});
              setForm({
                name: "",
                lastname: "",
                address: "",
                phone: "",
                pincode: "",
                flat: "",
                city: "",
                state: "",
                default: false,
              });
            }}
            className="w-full rounded-[10px] border border-dashed border-[#c0a8b0] px-4 py-[14px] text-center text-[13px] text-[#7B2D42]"
          >
            + Add New Address
          </button>
        </div>
      )}

      {showForm && (
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label className="text-sm font-medium text-[#5a4f4d]">
              PIN Code *
            </label>
            <input
              value={form.pincode}
              placeholder="Eg: 110001"
              className="mt-1 w-full rounded-lg border border-[#f0dde2] bg-[#fdf6f7] p-3 text-[#3e2f2b] outline-none placeholder:text-[#c9ada7] focus:border-[#7B2D42]"
              onChange={async (e) => {
                const pin = e.target.value.replace(/\D/g, "");
                setForm((prev: any) => ({ ...prev, pincode: pin }));

                if (pin.length === 6) {
                  try {
                    const res = await fetch(
                      `https://api.postalpincode.in/pincode/${pin}`
                    );
                    const data = await res.json();

                    if (data[0].Status === "Success") {
                      const post = data[0].PostOffice[0];

                      setForm((prev: any) => ({
                        ...prev,
                        pincode: pin,
                        city: post.District,
                        state: post.State,
                      }));
                    }
                  } catch {
                    console.error("Error fetching pincode");
                  }
                }
              }}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-[#5a4f4d]">City</label>
              <input
                value={form.city}
                disabled
                className="mt-1 w-full rounded-lg border border-[#f0dde2] bg-[#f4edef] p-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#5a4f4d]">
                State
              </label>
              <input
                value={form.state}
                disabled
                className="mt-1 w-full rounded-lg border border-[#f0dde2] bg-[#f4edef] p-3"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#5a4f4d]">
              Flat / Building No (Optional)
            </label>
            <input
              value={form.flat}
              placeholder="Eg: A1, Block D"
              className="mt-1 w-full rounded-lg border border-[#f0dde2] bg-[#fdf6f7] p-3 text-[#3e2f2b] outline-none placeholder:text-[#c9ada7] focus:border-[#7B2D42]"
              onChange={(e) => setForm({ ...form, flat: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#5a4f4d]">
              Complete Address *
            </label>
            <input
              value={form.address}
              placeholder="Eg: Plot no. 401"
              className="mt-1 w-full rounded-lg border border-[#f0dde2] bg-[#fdf6f7] p-3 text-[#3e2f2b] outline-none placeholder:text-[#c9ada7] focus:border-[#7B2D42]"
              onChange={(e) => {
                setForm({ ...form, address: e.target.value });

                if (errors.address) {
                  setErrors({ ...errors, address: "" });
                }
              }}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-[#5a4f4d]">
                First Name *
              </label>
              <input
                value={form.name}
                placeholder="Eg: Om"
                className="mt-1 w-full rounded-lg border border-[#f0dde2] bg-[#fdf6f7] p-3 text-[#3e2f2b] outline-none placeholder:text-[#c9ada7] focus:border-[#7B2D42]"
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });

                  if (errors.name) {
                    setErrors({ ...errors, name: "" });
                  }
                }}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[#5a4f4d]">
                Last Name (Optional)
              </label>
              <input
                value={form.lastname}
                placeholder="Eg: Sharma"
                className="mt-1 w-full rounded-lg border border-[#f0dde2] bg-[#fdf6f7] p-3 text-[#3e2f2b] outline-none placeholder:text-[#c9ada7] focus:border-[#7B2D42]"
                onChange={(e) => setForm({ ...form, lastname: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#5a4f4d]">
              Mobile Number *
            </label>
            <input
              value={form.phone}
              maxLength={10}
              placeholder="Eg: 9876543210"
              className="mt-1 w-full rounded-lg border border-[#f0dde2] bg-[#fdf6f7] p-3 text-[#3e2f2b] outline-none placeholder:text-[#c9ada7] focus:border-[#7B2D42]"
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setForm({ ...form, phone: value });

                if (errors.phone) {
                  setErrors({ ...errors, phone: "" });
                }
              }}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.default}
              onChange={(e) => setForm({ ...form, default: e.target.checked })}
            />
            <span className="text-sm text-[#5a4f4d]">
              Set as my default address
            </span>
          </div>

          <button
            onClick={saveAddress}
            className="mt-2 rounded-[10px] bg-[#7B2D42] py-3 text-white transition hover:opacity-90"
          >
            Save Address
          </button>
        </div>
      )}
    </div>
  );
}
