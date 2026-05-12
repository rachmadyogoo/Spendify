import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Wallet, Sparkles, LogOut, X, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { logout } from '../services/authService';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
  { icon: Wallet, label: 'Transaksi', path: '/app/transactions' },
  { icon: Sparkles, label: 'Monthly Wrapped', path: '/app/wrapped' },
  { icon: Target, label: 'Challenges', path: '/app/challenges' }
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed top-0 left-0 bottom-0 w-64 bg-card border-r border-border z-50 transition-transform lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="Spendify AI Logo" className="w-8 h-8" />
              <h2 className="text-xl font-black tracking-tighter">SPENDIFY</h2>
            </Link>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="pt-6 border-t border-border mt-auto">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-destructive gap-3"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span>Keluar</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
