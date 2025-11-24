import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, Upload, History, User, BookOpen, FileText, Calendar } from 'lucide-react';
import logo from '../images/logo.png';

export function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/statistics', label: 'Statistics', icon: BarChart3 },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/history', label: 'History', icon: History },
    { path: '/recommendations', label: 'Recommendations', icon: Calendar },
    { path: '/nutrition', label: 'Info', icon: BookOpen },
    { path: '/research', label: 'Paper', icon: FileText },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6A3A] to-[#FFD166] flex items-center justify-center p-1 shadow-lg">
              <img
                src={logo} 
                alt="SaborEsan Logo"
                className="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-white/80 ring-4 ring-orange-100 transition-transform duration-200 transform hover:scale-105"
              />
            </div>
            <span className="text-gray-900">SaborESAN</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#FF5733] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="md:hidden">
            <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden pb-4 pt-2 grid grid-cols-2 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#FF5733] text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
