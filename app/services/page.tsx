import {
  HeartHandshake,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import ServiceCard from "@/components/services/ServiceCard";
import ReviewCard from "@/components/services/ReviewCard";
import ReviewForm from "@/components/services/ReviewForm";

const services = [
  {
    id: 1,
    title: "Skincare Consultation",
    description:
      "Personalized sessions to help you build a glowing, balanced routine.",
    icon: <Sparkles size={24} />,
  },
  {
    id: 2,
    title: "Product Recommendations",
    description:
      "Custom beauty matches based on your skin goals and lifestyle.",
    icon: <ShieldCheck size={24} />,
  },
  {
    id: 3,
    title: "Fast Delivery",
    description:
      "Premium express shipping with careful handling and elegant packaging.",
    icon: <Package size={24} />,
  },
  {
    id: 4,
    title: "Quality Assurance",
    description:
      "Every product is curated for refinement, purity, and luxe performance.",
    icon: <HeartHandshake size={24} />,
  },
  {
    id: 5,
    title: "Easy Returns",
    description:
      "Hassle-free support for exchanges and returns with a calm experience.",
    icon: <Star size={24} />,
  },
];

const reviews = [
  {
    id: 1,
    name: "Mira Patel",
    rating: 5,
    review:
      "The service was beautifully attentive and the product advice felt luxurious.",
  },
  {
    id: 2,
    name: "Nina Sharma",
    rating: 5,
    review:
      "Fast delivery and premium packaging made the whole experience special.",
  },
  {
    id: 3,
    name: "Aria Kapoor",
    rating: 4,
    review: "The consultation helped me discover the perfect skincare ritual.",
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#fdf8f6] text-[#4a2c2a]">
      <section className="relative overflow-hidden">
        <img
          src="/hero/e1.jpeg"
          alt="Luxury beauty service background"
          className="h-[70vh] w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#7a1f2b]/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#7a1f2b]/30 via-transparent to-[#fdf8f6]/95" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.4em] text-white/80 animate-fadeUp">
            Our Services
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl animate-fadeUp">
            Luxury care tailored for your beauty
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-white/80 sm:text-base animate-fadeUp">
            Premium beauty services designed to elevate your ritual with
            thoughtful expertise and elegant comfort.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-[#7a1f2b]/80">
            Beauty Services
          </p>
          <h2 className="mt-5 text-3xl font-semibold text-[#4a2c2a] sm:text-4xl">
            A curated suite of premium experiences
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="animate-fadeUp"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <ServiceCard
                icon={service.icon}
                title={service.title}
                description={service.description}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-8 flex items-center justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[#7a1f2b]/80">
              Customer Reviews
            </p>
            <h3 className="mt-4 text-3xl font-semibold text-[#4a2c2a]">
              Loved by beauty connoisseurs
            </h3>
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-3 no-scrollbar">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              name={review.name}
              rating={review.rating}
              review={review.review}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] bg-white/95 p-8 shadow-[0_24px_64px_rgba(122,31,43,0.08)]">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.35em] text-[#7a1f2b]/80">
                Share your thoughts
              </p>
              <h3 className="mt-4 text-3xl font-semibold text-[#4a2c2a]">
                Give your opinion on the product
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#5a4f4d]">
                Your feedback helps us refine every offering and deliver a
                beautifully tailored experience.
              </p>
            </div>
            <ReviewForm />
          </div>
          <div className="rounded-[2rem] border border-[#e8d5c4] bg-[#fff9f5] p-8 shadow-[0_24px_64px_rgba(122,31,43,0.04)]">
            <p className="text-sm uppercase tracking-[0.35em] text-[#7a1f2b]/80">
              Why review?
            </p>
            <ul className="mt-6 space-y-5 text-sm text-[#5a4f4d]">
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-[#f7e1e4] text-[#7a1f2b]">
                  01
                </span>
                <span>
                  Help others discover the right luxury products for their
                  needs.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-[#f7e1e4] text-[#7a1f2b]">
                  02
                </span>
                <span>
                  Support a seamless experience with concise, useful feedback.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-[#f7e1e4] text-[#7a1f2b]">
                  03
                </span>
                <span>
                  Future-ready structure for customer insights and backend
                  integration.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
