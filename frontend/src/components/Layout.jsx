import Navbar from './Navbar';
import MobileNav from './MobileNav';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#f6f6fa] pb-20 dark:bg-slate-950 lg:pb-0">
      <div className="ambient" aria-hidden="true" />
      <Navbar />
      <main className="container-x pt-6 pb-24 lg:py-12">{children}</main>
      <MobileNav />
    </div>
  );
}
