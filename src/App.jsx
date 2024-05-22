// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './tailwind.css'; // ou './tailwind.css' selon votre configuration
import Signup from './components/Signup/Signup';
import Login from './components/Login/Login';
import NotFound from './components/NotFound/NotFound';
import MapPage from './components/MapPage/MapPage';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import AccessDenied from './components/AccessDenied/AccessDenied';
import ViewAllUsers from './components/ViewAllUsers/ViewAllUsers';
import UserInformation from './components/UserInformation/UserInformation';
import ViewAllSafeZones from './components/ViewAllSafeZones/ViewAllSafeZones';
import DangerZoneManagingPage from './components/DangerZoneManagingPage/DangerZoneManagingPage';
import AddDangerZonePage from './components/AddDangerZonePage/AddDangerZonePage';
import ViewAllDangerZones from './components/ViewAllDangerZones/ViewAllDangerZones';
import ViewUpdateDangerZonePage from './components/ViewUpdateDangerZone/ViewUpdateDangerZonePage';
import LocationInfoPage from './components/LocationInfoPage/LocationInfoPage';
import ViewMarkerDetails from './components/ViewMarkerDetails/ViewMarkerDetails';
import ActivityLogs from './components/ActivityLogs/ActivityLogs';
import UserActivityLog from './components/UserActivityLog/UserActivityLog';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/register' element={<ProtectedRoute><Signup /></ProtectedRoute>} />
        <Route path='/login' element={<Login />} />
        <Route path='/map' element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
        <Route path='*' element={<Navigate to='/not-found' />} />
        <Route path='/not-found' element={<NotFound />} />
        <Route
          path='/admindashboard'
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/accessdenied'
          element={
            <ProtectedRoute>
              <AccessDenied />
            </ProtectedRoute>
          }
        />
        <Route
          path='/viewallusers'
          element={
            <ProtectedRoute>
              <ViewAllUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path='/userinformation/:userId'
          element={
            <ProtectedRoute>
              <UserInformation />
            </ProtectedRoute>
          }
        />
        <Route
          path='/viewallsafezones'
          element={
            <ProtectedRoute>
              <ViewAllSafeZones />
            </ProtectedRoute>
          }
        />

        <Route
          path='/dangerzonesmanagingpage'
          element={
            <ProtectedRoute>
              <DangerZoneManagingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/adddangerzone'
          element={
            <ProtectedRoute>
              <AddDangerZonePage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/viewalldangerzones'
          element={
            <ProtectedRoute>
              <ViewAllDangerZones />
            </ProtectedRoute>
          }
        />
        <Route
          path='/viewupdatedangerzone/:id'
          element={
            <ProtectedRoute>
              <ViewUpdateDangerZonePage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/location/:lng/:lat'
          element={
            <ProtectedRoute>
              <LocationInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/marker/:coordinates'
          element={
            <ProtectedRoute>
              <ViewMarkerDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path='/activitylogs'
          element={
            <ProtectedRoute>
              <ActivityLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path='/activitylogs/useractivitylog/:username'
          element={
            <ProtectedRoute>
              <UserActivityLog />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
