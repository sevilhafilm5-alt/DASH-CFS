import React from 'react';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isCollapsed: boolean;
}

const NavItem: React.FC<{
  icon: JSX.Element;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, isCollapsed, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-brand-primary text-white'
        : 'text-text-secondary hover:bg-base-300/60 hover:text-text-primary'
    } ${isCollapsed ? 'justify-center' : ''}`}
  >
    {React.cloneElement(icon, { className: 'w-6 h-6' })}
    <span className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{label}</span>
  </button>
);

const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
);

const TeamIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962A3.75 3.75 0 0 1 9 12.75a3.75 3.75 0 0 1 3.75-3.75m0 0a3.75 3.75 0 0 1 3.75 3.75M9 12.75a3.75 3.75 0 0 0-3.75 3.75m0 0a3 3 0 0 0-3.741 2.53m11.242-2.53a9.094 9.094 0 0 1-3.741.479m-7.5 0a9.094 9.094 0 0 1-3.741-.479M12 1.5a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />
    </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isCollapsed }) => {
  return (
    <aside className={`bg-base-100 border-r border-base-300 flex flex-col p-4 relative transition-all duration-300 ${isCollapsed ? 'w-0 md:w-24' : 'w-64'}`}>
      <div className="flex items-center h-16 mb-6 overflow-hidden">
        <h1 className={`text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-yellow-400 text-transparent bg-clip-text animate-gradient-x transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'text-3xl' : 'text-xl'}`}>
          {isCollapsed ? 'CFS' : 'Cosméticos Full Service'}
        </h1>
      </div>
      <nav className="flex flex-col space-y-2">
        <NavItem
          icon={<DashboardIcon />}
          label="Dashboard"
          isActive={activeView === View.Dashboard}
          isCollapsed={isCollapsed}
          onClick={() => setActiveView(View.Dashboard)}
        />
        <NavItem
          icon={<TeamIcon />}
          label="Equipe"
          isActive={activeView === View.Team}
          isCollapsed={isCollapsed}
          onClick={() => setActiveView(View.Team)}
        />
      </nav>
    </aside>
  );
};