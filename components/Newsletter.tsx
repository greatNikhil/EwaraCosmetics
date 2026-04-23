"use client";
import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  return (
    <section className="bg-[#fdf8f6] py-10 md:py-12  text-center">
      <h2 className="text-xl md:text-2xl font-semibold text-[#3e2f2b]">
        Don’t miss an update!
      </h2>

      <p className="text-sm md:text-base text-[#7a6f6b] mt-3 max-w-xl mx-auto">
        Get latest product drops, offers and updates straight to your inbox
      </p>

      {/* INPUT */}
      <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-3 ">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full md:w-80 px-4 py-3 rounded-xl 
                     bg-white border border-[#ead2d8] 
                     focus:outline-none focus:ring-2 focus:ring-[#7a1f2b]/30"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        <button
          className="px-6 py-3 rounded-xl text-white font-medium 
                     bg-gradient-to-r from-[#7a1f2b] to-[#d4a373] 
                     hover:scale-105 transition"
          onClick={() => {
            if (!email) {
              setMessage("Please enter email ❗");
              return;
            }

            const existing = JSON.parse(
              localStorage.getItem("subscribers") || "[]",
            );

            if (existing.includes(email)) {
              setMessage("Already subscribed 😏");
              return;
            }

            const updated = [...existing, email];

            localStorage.setItem("subscribers", JSON.stringify(updated));

            setMessage("Subscribed successfully ✅");
            setEmail("");

            setTimeout(() => setMessage(""), 2000);
          }}
        >
          SUBSCRIBE
        </button>
        {message && <p className="text-sm mt-3 text-[#7a1f2b]">{message}</p>}
      </div>
    </section>
  );
}
