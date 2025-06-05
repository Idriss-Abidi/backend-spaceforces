import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface SpaceLayoutProps {
  children: React.ReactNode;
}


export default function SpaceLayout({ children }: SpaceLayoutProps) {
  return (
    <div className="min-h-[100dvh] text-white relative overflow-hidden">
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at bottom center, #6A0DAD 0%, #4B0082 20%, #2E0854 40%, #1A0033 60%, #000000 100%)",
        }}
      />

      <div className="relative z-10">
        <Header />
        {children}
        <Footer />
      </div>
    </div>
  );
}
