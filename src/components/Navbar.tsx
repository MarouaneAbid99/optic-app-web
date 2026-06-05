import { useState } from 'react';
import { Menu, LogOut, ChevronDown, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';

interface Props {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: Props) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <span className="hidden sm:block font-medium text-gray-700 max-w-[140px] truncate">
            {user?.fullName}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 z-20 py-1">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <p className="text-xs text-blue-600 font-medium mt-0.5">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
