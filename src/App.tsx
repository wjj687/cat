/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import Home from './pages/Home';
import MyCats from './pages/MyCats';
import CatDex from './pages/CatDex';
import Timeline from './pages/Timeline';
import Capture from './pages/Capture';
import CatDetail from './pages/CatDetail';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/my-cats" element={<MyCats />} />
          <Route path="/cat-dex" element={<CatDex />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/capture" element={<Capture />} />
          <Route path="/cat/:id" element={<CatDetail />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
