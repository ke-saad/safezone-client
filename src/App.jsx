import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './tailwind.css'; 
import Signup from './components/Signup/Signup';
import Login from './components/Login/Login';
import NotFound from './components/NotFound/NotFound';
import MapPage from './components/MapPage/MapPage';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import AccessDenied from './components/AccessDenied/AccessDenied';
import ViewAllUsers from './components/ViewAllUsers/ViewAllUsers';
import UserInformation from './components/UserInformation/UserInformation';
import ViewAllSafeZones from './components/ViewAllSafeZones/ViewAllSafeZones';
import ViewAllDangerZones from './components/ViewAllDangerZones/ViewAllDangerZones';
import LocationInfoPage from './components/LocationInfoPage/LocationInfoPage';
import ViewMarkerDetails from './components/ViewMarkerDetails/ViewMarkerDetails';
import ActivityLogs from './components/ActivityLogs/ActivityLogs';
import UserActivityLog from './components/UserActivityLog/UserActivityLog';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AlertsPage from './components/AlertsPage/AlertsPage';
import SingleAlertPage from './components/SingleAlertPage/SingleAlertPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/register' element={<ProtectedRoute><Signup /></ProtectedRoute>} />
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<Login />} />
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
          path='/alertspage'
          element={
            <ProtectedRoute>
              <AlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/alert/:id'
          element={
            <ProtectedRoute>
              <SingleAlertPage />
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
          path='/viewalldangerzones'
          element={
            <ProtectedRoute>
              <ViewAllDangerZones />
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
