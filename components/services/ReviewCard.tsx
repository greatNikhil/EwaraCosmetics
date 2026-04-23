import { Star } from "lucide-react";

interface ReviewCardProps {
  name: string;
  rating: number;
  review: string;
}

export default function ReviewCard({ name, rating, review }: ReviewCardProps) {
  return (
    <div
      className="min-w-[18rem] max-w-sm rounded-[2rem] 
                 border border-[#f2cfd6] 
                 bg-gradient-to-br from-[#ffe9ee] to-[#ffdce5] 
                 p-6 
                 shadow-[0_20px_60px_rgba(122,31,43,0.15)] 
                 hover:shadow-[0_30px_80px_rgba(122,31,43,0.25)] 
                 hover:-translate-y-1 
                 transition-all duration-300"
    >
      <div className="mb-4 flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={18}
            className={`transition-colors duration-300 ${
              index < rating
                ? "fill-[#f5c542] text-[#f5c542] scale-105"
                : "text-[#e0cfcf]"
            }`}
          />
        ))}
      </div>
      <p className="mb-5 text-sm leading-7 text-[#5a4f4d]">“{review}”</p>
      <p className="text-sm font-semibold text-[#4a2c2a]">{name}</p>
    </div>
  );
}
