export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto grid grid-cols-[180px_1fr_260px] gap-x-5 relative pt-5">
      <div className="h-[580px] p-2 rounded-2xl  sticky top-20 bg-background shadow-2xl"></div>
      {children}
      <div className="h-[580px] p-2 rounded-2xl  sticky top-20 bg-background shadow-2xl"></div>
    </div>
  );
}
