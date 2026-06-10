import toast from "react-hot-toast";
import { Check, X } from "lucide-react";

export const showAddedToBagToast = () => {
  toast.custom((t) => (
    <div
      className={`pointer-events-auto w-[340px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[18px] border border-[#ecd8cf] bg-white shadow-[0_18px_55px_rgba(70,35,30,0.14)] transition-all duration-300 ${
        t.visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
      }`}
    >
      <div className="flex items-stretch">
        <div className="w-1 shrink-0 bg-[#7a1f2b]" />

        <div className="flex flex-1 items-start gap-3 px-4 py-3.5">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f8eded] text-[#7a1f2b]">
            <Check className="h-5 w-5" strokeWidth={2.5} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold leading-5 text-[#2d1c1d]">
              Added to bag!
            </p>
            <p className="mt-0.5 text-[12px] font-medium text-[#9a8d87]">
              View bag to checkout
            </p>
          </div>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#b7aca5] transition hover:bg-[#faf4f1] hover:text-[#8b7d75]"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div className="h-[3px] overflow-hidden bg-[#f5ede7]">
        <div className="h-full w-full origin-left bg-[#7a1f2b] animate-bag-toast-progress" />
      </div>
    </div>
  ));
};
