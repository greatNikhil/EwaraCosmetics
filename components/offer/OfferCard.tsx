interface OfferCardProps {
  image: string;
  title: string;
  description: string;
}

export default function OfferCard({
  image,
  title,
  description,
}: OfferCardProps) {
  return (
    <div className="group overflow-hidden rounded-[2rem] bg-white/85 shadow-[0_28px_60px_rgba(122,31,43,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#fdf8f6]">
        <img
          src={image}
          alt={title}
          className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-[#7a1f2b]/80 mb-3">
          Limited Time
        </p>
        <h3 className="text-xl font-semibold text-[#4a2c2a] mb-2">{title}</h3>
        <p className="text-sm leading-6 text-[#5a4f4d]">{description}</p>
      </div>
    </div>
  );
}
