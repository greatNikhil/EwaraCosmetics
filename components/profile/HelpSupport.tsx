"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type HelpSupportProps = {
  supportCards: Array<{
    title: string;
    subtitle: string;
    href: string;
    external: boolean;
    icon: any;
  }>;
};

export default function HelpSupport({ supportCards }: HelpSupportProps) {
  return (
    <div className="space-y-4">
      {supportCards.map((card) => (
        <Link
          key={card.title}
          href={card.href}
          target={card.external ? "_blank" : undefined}
          rel={card.external ? "noreferrer" : undefined}
          className="flex items-center justify-between rounded-[10px] border border-[#f0dde2] bg-[#fdf6f7] px-4 py-[14px]"
        >
          <div className="flex items-center gap-3">
            <card.icon
              size={18}
              className="text-[#7B2D42]"
              strokeWidth={1.8}
            />
            <div>
              <p className="text-sm font-medium text-[#2f1f25]">{card.title}</p>
              <p className="text-sm text-[#7f6b73]">{card.subtitle}</p>
            </div>
          </div>
          <ChevronRight
            size={16}
            className="text-[#8f6d78]"
            strokeWidth={1.8}
          />
        </Link>
      ))}
    </div>
  );
}
