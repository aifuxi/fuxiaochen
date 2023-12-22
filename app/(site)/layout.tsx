import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col relative">
      <Navbar />
      <section className="flex-1 flex flex-col overflow-x-hidden relative">
        {children}

        <Footer />
      </section>
    </main>
  );
}
