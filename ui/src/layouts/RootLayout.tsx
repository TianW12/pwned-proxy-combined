import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-lime-100">
      <Header />
      <main className="flex-1">
        <Outlet /> {/* the current page gets injected RIGHT HERE */}
      </main>
      <Footer />
    </div>
  );
}
