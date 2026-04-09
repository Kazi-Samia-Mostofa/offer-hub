import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import TrendingCarousel from "@/components/TrendingCarousel";
import TopStores from "@/components/TopStores";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TrendingCarousel />
        <TopStores />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
