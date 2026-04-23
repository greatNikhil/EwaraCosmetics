import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    title: "Skincare",
    description: "Nourish your glow with luxurious skincare essentials.",
    href: "/category/skincare",
    image: "/slider/skin.jpg",
  },
  {
    title: "Fragrance",
    description: "Discover premium scents that linger with elegance.",
    href: "/category/fragrance",
    image: "/slider/l5.jpeg",
  },
  {
    title: "Haircare",
    description: "Strengthen and shine with salon-quality hair rituals.",
    href: "/category/hair",
    image: "/slider/d1.jpeg",
  },
];

export default function CategoryPage() {
  return (
    <section className="bg-[#fdf8f6] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="group block overflow-hidden rounded-[28px] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="bg-gradient-to-b from-[#f7f0ff] to-[#f6ecff] px-4 py-5 sm:px-5 sm:py-6">
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#7a1f2b] font-semibold mb-2">
                  {category.title}
                </p>
                <h2 className="text-lg sm:text-xl font-semibold text-[#4a2c2a] mb-3">
                  {category.title}
                </h2>
                <p className="text-sm sm:text-base text-[#5a4f4d] mb-5 leading-6">
                  {category.description}
                </p>
                <span className="inline-flex items-center justify-center rounded-full border border-[#7a1f2b] bg-white px-4 py-2 text-sm font-semibold text-[#7a1f2b] transition-colors duration-300 group-hover:bg-[#7a1f2b] group-hover:text-white">
                  SHOP {category.title.toUpperCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
