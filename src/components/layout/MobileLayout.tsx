/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, showNav = true }) => {
  return (
    <div className="min-h-screen bg-[#fdf9f3] dark:bg-stone-950 text-[#1c1c18] dark:text-stone-100 font-body selection:bg-[#ffdbd1] selection:text-[#3b0900]">
      <div className="max-w-md mx-auto min-h-screen relative flex flex-col">
        <main className={`flex-1 ${showNav ? 'pb-32' : ''}`}>
          {children}
        </main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
};

export default MobileLayout;
