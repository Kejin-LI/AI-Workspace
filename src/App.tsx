import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { RequesterLayout } from './layouts/RequesterLayout';
import { LandingPage } from './pages/LandingPage';
import { Workbench } from './pages/Workbench';
import { Market } from './pages/Market';
import { Community } from './pages/Community';
import { Sandbox } from './pages/Sandbox';
import { UserProfile } from './pages/UserProfile';
import { RequesterDashboard } from './pages/RequesterDashboard';
import { RequesterTasks } from './pages/RequesterTasks';
import { RequesterProjects } from './pages/RequesterProjects';
import { TaskHall } from './pages/TaskHall';
import { ModelLeaderboard } from './pages/ModelLeaderboard';
import { ProjectProvider } from './contexts/ProjectContext';

// Placeholder components for other pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold text-gray-300">{title}</h1>
    <p className="text-gray-400 mt-2">Coming Soon</p>
  </div>
);

function App() {
  return (
    <ProjectProvider>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Requester Routes (Demand Side) */}
        <Route path="/requester" element={<RequesterLayout />}>
          <Route index element={<RequesterDashboard />} />
          <Route path="tasks" element={<RequesterTasks />} />
          <Route path="projects" element={<RequesterProjects />} />
          <Route path="reports" element={<Placeholder title="Data Reports" />} />
          <Route path="settings" element={<Placeholder title="Enterprise Settings" />} />
        </Route>

        {/* Expert Routes (Supply Side) */}
        <Route path="/expert" element={<DashboardLayout />}>
          <Route index element={<TaskHall />} />
          <Route path="workbench" element={<Workbench />} />
          <Route path="leaderboard" element={<ModelLeaderboard />} />
          <Route path="sandbox" element={<Sandbox />} />
          <Route path="market" element={<Market />} />
          <Route path="community" element={<Community />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="challenges" element={<Placeholder title="Prestige Challenges" />} />
          <Route path="settings" element={<Placeholder title="Settings" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ProjectProvider>
  );
}

export default App;