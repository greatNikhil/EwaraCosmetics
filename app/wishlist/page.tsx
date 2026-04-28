"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, X } from "lucide-react";
import {
  getWishlistItems,
  removeFromWishlist,
  wishlistChangedEvent,
  type WishlistItem,
} from "@/utils/wishlist";
import { addToCart } from "@/utils/cart";

const imageHeightClasses = [
  "h-[250px]",
  "h-[195px]",
  "h-[230px]",
  "h-[185px]",
];

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const syncWishlist = async () => {
      const items = await getWishlistItems();
      setWishlist(items);
    };

    const handleWishlistChanged = () => {
      syncWishlist();
    };

    syncWishlist();
    window.addEventListener(wishlistChangedEvent, handleWishlistChanged);
    window.addEventListener("storage", handleWishlistChanged);

    return () => {
      window.removeEventListener(wishlistChangedEvent, handleWishlistChanged);
      window.removeEventListener("storage", handleWishlistChanged);
    };
  }, []);

  const totalValue = useMemo(
    () => wishlist.reduce((sum, item) => sum + Number(item.price || 0), 0),
    [wishlist]
  );

  const handleRemove = async (_id: string) => {
    await removeFromWishlist(_id);
    const items = await getWishlistItems();
    setWishlist(items);
  };

  const handleAddToBag = (item: WishlistItem) => {
    addToCart({
      _id: item._id,
      name: item.name,
      price: item.price,
      images: [item.image || "/favicon/product.jpeg"],
      category: item.category,
      brand: item.brand,
    });
  };

  const handleAddAllToBag = () => {
    wishlist.forEach((item) => {
      addToCart({
        _id: item._id,
        name: item.name,
        price: item.price,
        images: [item.image || "/favicon/product.jpeg"],
        category: item.category,
        brand: item.brand,
      });
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f4f0] px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-[1280px]">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-4xl text-[#3d2b2a] md:text-[3.35rem]">
            Your Curated Collection
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#91827b] md:text-[15px]">
            A personalized selection of your favorite Ewara formulations, ready
            to be added to your ritual.
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="mx-auto mt-14 max-w-3xl rounded-[32px] border border-[#eee5df] bg-white px-8 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f2e3df] text-[#d2a298]">
              <Heart size={26} strokeWidth={1.8} />
            </div>
            <h2 className="mt-6 font-serif text-3xl text-[#3d2b2a]">
              Your wishlist is empty
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#91827b]">
              Explore the collection and save the pieces you want to come back
              to later.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex rounded-full bg-[#d9a59d] px-7 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#cc958c]"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="mt-14 columns-1 gap-6 md:columns-2 xl:columns-3">
            {wishlist.map((item, index) => (
              <article
                key={item._id}
                className="mb-6 break-inside-avoid rounded-[28px] border border-[#eee5df] bg-white p-3 shadow-[0_6px_24px_rgba(84,63,57,0.03)]"
              >
                <div
                  className={`relative overflow-hidden rounded-[22px] bg-[#efe7e1] ${
                    imageHeightClasses[index % imageHeightClasses.length]
                  }`}
                >
                  <img
                    src={item.image || "/favicon/product.jpeg"}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemove(item._id)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#b69e97] shadow-sm transition hover:bg-white hover:text-[#8f6b69]"
                    aria-label={`Remove ${item.name} from wishlist`}
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>

                <div className="px-2 pb-2 pt-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#c6aba5]">
                    {item.category || item.brand || "Ewara"}
                  </p>

                  <div className="mt-2 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="font-serif text-[1.75rem] leading-none text-[#3d2b2a] md:text-[1.9rem] xl:text-[1.75rem]">
                        {item.name}
                      </h2>
                      <p className="mt-2 text-sm text-[#9d8d86]">
                        {item.brand || "Ewara signature formula"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xl font-medium text-[#3d2b2a]">
                        ${Number(item.price || 0).toFixed(2)}
                      </p>
                      {item.originalPrice && item.originalPrice > item.price ? (
                        <p className="mt-1 text-sm text-[#c2b3ad] line-through">
                          ${Number(item.originalPrice).toFixed(2)}
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToBag(item)}
                      className="rounded-full bg-[#d9a59d] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#cc958c]"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              </article>
            ))}

            <aside className="mb-6 break-inside-avoid rounded-[28px] border border-[#eee5df] bg-[#efe3dd] px-7 py-10 text-center shadow-[0_6px_24px_rgba(84,63,57,0.03)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#e1c8c2] bg-white text-[#d9a59d]">
                <ShoppingBag size={22} strokeWidth={1.8} />
              </div>
              <h2 className="mt-7 font-serif text-[2rem] text-[#4b3633]">
                Add All to Bag
              </h2>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[#988780]">
                Experience the complete Ewara ritual with your saved selection.
              </p>
              <button
                type="button"
                onClick={handleAddAllToBag}
                className="mt-8 inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#d9a59d] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#cc958c]"
              >
                Add {wishlist.length} {wishlist.length === 1 ? "Item" : "Items"} - $
                {totalValue.toFixed(2)}
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
