import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAgencyStore } from '../store/agencyStore';
import { BASE_URL } from '../api/client';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const { settings: agencySettings, fetchSettings } = useAgencyStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  
  // Couleurs personnalisées ou couleurs par défaut
  const sidebarBgColor = agencySettings?.sidebar_color || '#1e1b4b';
  const primaryColor = agencySettings?.primary_color || '#4f46e5';
  const agencyName = agencySettings?.name || 'Pèlerinage';
  const agencyTagline = agencySettings?.tagline || 'Gestion Hadj & Omra';
  const logoUrl = agencySettings?.logo ? `${BASE_URL}/media/${agencySettings.logo}` : null;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/pilgrims', label: 'Pèlerins', icon: '👥' },
    { path: '/payments', label: 'Paiements', icon: '💳' },
    { path: '/receipts', label: 'Reçus', icon: '📄' },
    { path: '/tickets', label: 'Billetterie', icon: '✈️' },
    { path: '/expenses', label: 'Dépenses', icon: '📝' },
    { path: '/treasury', label: 'Trésorerie', icon: '💰' },
  ];

  const adminItems = [
    { path: '/users', label: 'Utilisateurs', icon: '👤' },
    { path: '/roles', label: 'Rôles', icon: '🔐' },
    { path: '/agency-settings', label: 'Paramètres Agence', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div 
          className="flex flex-col flex-grow overflow-y-auto shadow-2xl"
          style={{ 
            background: `linear-gradient(to bottom, ${sidebarBgColor}, ${sidebarBgColor}dd)`
          }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center h-20 px-4" style={{ backgroundColor: `${sidebarBgColor}80` }}>
            <div className="flex items-center space-x-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-2xl">
                  🕌
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-white">{agencyName}</h1>
                <p className="text-xs text-indigo-300">{agencyTagline}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-white text-indigo-900 shadow-lg scale-105'
                    : 'text-indigo-100 hover:bg-indigo-800 hover:text-white hover:scale-105'
                  }
                `}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                <span>{item.label}</span>
                {isActive(item.path) && (
                  <div className="ml-auto w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                )}
              </Link>
            ))}

            {/* Section Administration (Admin uniquement) */}
            {user?.role_type === 'admin' && (
              <>
                <div className="mt-6 pt-6 border-t border-indigo-700">
                  <p className="px-4 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                    Administration
                  </p>
                  {adminItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                        ${isActive(item.path)
                          ? 'bg-white text-indigo-900 shadow-lg scale-105'
                          : 'text-indigo-100 hover:bg-indigo-800 hover:text-white hover:scale-105'
                        }
                      `}
                    >
                      <span className="text-xl mr-3">{item.icon}</span>
                      <span>{item.label}</span>
                      {isActive(item.path) && (
                        <div className="ml-auto w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                      )}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-indigo-800">
            <div className="bg-indigo-950/50 rounded-xl p-4 mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.username?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.username}
                  </p>
                  <p className="text-xs text-indigo-300 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <span className="mr-2">🚪</span>
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${sidebarBgColor})` }}
              >
                🕌
              </div>
            )}
            <h1 className="text-lg font-bold text-gray-900">{agencyName}</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white shadow-xl">
            <nav className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all
                    ${isActive(item.path)
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              {user?.role === 'admin' && (
                <Link
                  to="/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all
                    ${isActive('/users')
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="text-xl mr-3">⚙️</span>
                  <span>Utilisateurs</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all"
              >
                <span className="mr-2">🚪</span>
                <span>Déconnexion</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="pt-20 lg:pt-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
