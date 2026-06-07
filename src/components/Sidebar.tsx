import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Eye, Package, Boxes, Truck,
  ShoppingCart, FileText, Settings, X,
} from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/prescriptions', label: 'Ordonnances', icon: Eye },
  { to: '/products', label: 'Produits', icon: Package },
  { to: '/inventory', label: 'Stocks', icon: Boxes },
  { to: '/suppliers', label: 'Fournisseurs', icon: Truck },
  { to: '/orders', label: 'Commandes', icon: ShoppingCart },
  { to: '/insurance', label: 'Assurances', icon: FileText },
  { to: '/settings', label: 'Paramètres', icon: Settings },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 w-60 bg-slate-900 flex flex-col transition-transform duration-200 lg:relative lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">OpticApp</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
