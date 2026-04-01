/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PawPrint, LayoutGrid, BookOpen, PlusCircle } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { icon: Home, label: '首页', path: '/' },
    { icon: PawPrint, label: '我的猫', path: '/my-cats' },
    { icon: PlusCircle, label: '记录', path: '/capture', isFab: true },
    { icon: LayoutGrid, label: '图鉴', path: '/cat-dex' },
    { icon: BookOpen, label: '时光', path: '/timeline' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50 flex justify-around items-center px-2 py-1 bg-white/85 dark:bg-stone-900/85 backdrop-blur-xl rounded-full shadow-[0px_12px_32px_rgba(153,69,44,0.06)] border border-white/20">
      {navItems.map((item) => {
        if (item.isFab) {
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 group transition-transform active:scale-95`
              }
            >
              <div className="bg-gradient-to-br from-[#99452c] to-[#e27d60] w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-[0px_12px_32px_rgba(153,69,44,0.2)]">
                <item.icon size={32} />
              </div>
              <span className="font-body font-medium text-[10px] text-[#645e49] mt-1">{item.label}</span>
            </NavLink>
          );
        }

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-3 transition-all active:scale-90 ${
                isActive ? 'text-[#99452c]' : 'text-[#645e49] dark:text-stone-400'
              }`
            }
          >
            <item.icon size={24} fill={window.location.pathname === item.path ? "currentColor" : "none"} />
            <span className="font-body font-medium text-[10px] mt-1">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
