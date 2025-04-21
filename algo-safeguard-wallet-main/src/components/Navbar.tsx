
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { 
  Home, 
  Wallet, 
  History, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
    const isActive = location.pathname === to;

    return (
      <Link
        to={to}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
          "hover:bg-accent/80",
          isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        {icon}
        <span>{label}</span>
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </Link>
    );
  };

  if (!isAuthenticated) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center"
          >
            <div className="h-9 w-auto mr-2">
              <img 
                src="/lovable-uploads/c088585a-e0cf-4b9a-b8e0-d1f743d9ac6e.png" 
                alt="WadzPay Logo" 
                className="h-full w-auto object-contain" 
              />
            </div>
            {/* Removed "WadzPay Wallet" text */}
          </motion.div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <NavLink to="/dashboard" icon={<Home size={18} />} label="Dashboard" />
          <NavLink to="/transactions" icon={<History size={18} />} label="Transactions" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </Button>
        </nav>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t"
          >
            <div className="flex flex-col p-4 space-y-3 bg-background">
              <NavLink to="/dashboard" icon={<Home size={18} />} label="Dashboard" />
              <NavLink to="/transactions" icon={<History size={18} />} label="Transactions" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center justify-start gap-2 text-muted-foreground"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
