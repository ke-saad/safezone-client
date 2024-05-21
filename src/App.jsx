// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup/Signup';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import Aboutus from './components/Aboutus/Aboutus';
import NotFound from './components/NotFound/NotFound';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import MapPage from './components/MapPage/MapPage';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import AccessDenied from './components/AccessDenied/AccessDenied';
import UsersManagingPage from './components/UsersManagingPage/UsersManagingPage';
import ViewAllUsers from './components/ViewAllUsers/ViewAllUsers';
import UpdateViewAUser from './components/UpdateViewAUser/UpdateViewAUser';
import UserInformation from './components/UserInformation/UserInformation';
import SafeZoneManagingPage from './components/SafeZoneManagingPage/SafeZoneManagingPage';
import AddSafeZonePage from './components/AddSafeZonePage/AddSafeZonePage';
import ViewAllSafeZones from './components/ViewAllSafeZones/ViewAllSafeZones';
import ViewUpdateSafeZone from './components/ViewUpdateSafeZone/ViewUpdateSafeZone';
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
        <Route path="/aboutus" element={<Aboutus />} />
        <Route path='/' element={<Home />} />
        <Route path='/map' element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
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
          path='/users-managing'
          element={
            <ProtectedRoute>
              <UsersManagingPage />
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
          path='/updateviewauser'
          element={
            <ProtectedRoute>
              <UpdateViewAUser />
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
          path='/safezonesmanagingpage'
          element={
            <ProtectedRoute>
              <SafeZoneManagingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/addsafezone'
          element={
            <ProtectedRoute>
              <AddSafeZonePage />
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
          path='/viewupdatesafezone/:id'
          element={
            <ProtectedRoute>
              <ViewUpdateSafeZone />
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
