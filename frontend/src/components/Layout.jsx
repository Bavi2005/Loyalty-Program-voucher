import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#f6f6fa] dark:bg-slate-950">
      <div className="ambient" aria-hidden="true" />
      <Navbar />
      <main className="container-x py-10 lg:py-12">{children}</main>
    </div>
  );
}
