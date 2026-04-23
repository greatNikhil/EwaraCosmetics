import type { ReactNode } from "react";

interface HelpCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function HelpCard({ icon, title, description }: HelpCardProps) {
  return (
    <div className="group overflow-hidden rounded-3xl bg-white/90 p-6 shadow-[0_24px_64px_rgba(122,31,43,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_74px_rgba(122,31,43,0.16)]">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7e1e4] text-[#7a1f2b]">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[#4a2c2a] mb-3">{title}</h3>
      <p className="text-sm leading-6 text-[#5a4f4d]">{description}</p>
    </div>
  );
}
