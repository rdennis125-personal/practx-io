import { NavLink, Outlet } from 'react-router-dom';
import logo from '@swa-assets/logo.png';
import { Button } from './ui/button';

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-white text-brand-primary shadow-sm'
      : 'text-brand-muted hover:bg-white/60 hover:text-brand-primary'
  }`;

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-brand-surface text-brand-text">
      <header className="border-b border-brand-muted/20 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Practx" className="h-[60px] w-auto" />
            <nav className="flex items-center gap-2">
              <NavLink to="/" className={navLinkClasses} end>
                Home
              </NavLink>
              <NavLink to="/clinics/22222222-2222-2222-2222-222222222222/devices" className={navLinkClasses}>
                Devices
              </NavLink>
            </nav>
          </div>
          <Button variant="secondary" className="text-sm font-medium">
            Sign out
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
