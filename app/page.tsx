import Hero from "@/app/home/Hero";
import Products from "@/components/product";
import CategorySlider from "@/components/CategorySlider";
export default function HomePage() {
  return (
    <div>
      <Hero /> {/* ❌ no animation */}
      <CategorySlider />
      <Products /> {/* ✅ fade */}
    </div>
  );
}
