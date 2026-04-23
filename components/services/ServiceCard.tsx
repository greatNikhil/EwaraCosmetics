import type { ReactNode } from "react";

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function ServiceCard({
  icon,
  title,
  description,
}: ServiceCardProps) {
  return (
    <div className="group overflow-hidden rounded-[2rem] bg-white/90 p-6 shadow-[0_24px_64px_rgba(122,31,43,0.08)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_28px_74px_rgba(122,31,43,0.16)]">
      <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-[#f7e1e4] text-[#7a1f2b] shadow-sm transition-transform duration-300 group-hover:scale-105">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[#4a2c2a] mb-3">{title}</h3>
      <p className="text-sm leading-7 text-[#5a4f4d]">{description}</p>
    </div>
  );
}
