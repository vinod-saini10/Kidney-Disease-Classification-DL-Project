import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Activity, LayoutDashboard, Database } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { 
      name: 'Dashboard', 
      icon: LayoutDashboard, 
      path: user?.role === 'admin' ? '/admin' : '/dashboard', 
      roles: ['user', 'admin'] 
    },
    { name: 'New Prediction', icon: Activity, path: '/predict', roles: ['user'] },
    { name: 'Admin Panel', icon: Database, path: '/admin/panel', roles: ['admin'] },
  ];

  return (
    <div className="w-64 bg-white h-screen shadow-lg flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-primary-600 flex items-center gap-2">
          <Activity size={28} />
          KidneyAI
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.filter(item => item.roles.includes(user?.role)).map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors font-medium"
          >
            <item.icon size={20} />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-4 py-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold overflow-hidden shadow-sm">
            {user?.image ? (
              <img src={`http://localhost:8080/${user.image}`} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || <User size={20} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium border border-transparent hover:border-red-100"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
