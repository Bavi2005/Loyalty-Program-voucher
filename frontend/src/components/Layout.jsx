import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#f6f6fa] dark:bg-slate-950">
      <div className="ambient" aria-hidden="true" />
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">{children}</main>
    </div>
  );
}
