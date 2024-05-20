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
import ViewUpdateDangerZonePage from './components/ViewUpdateDangerZonePage/ViewUpdateDangerZonePage';
import LocationInfoPage from './components/LocationInfoPage/LocationInfoPage';
import ViewMarkerDetails from './components/ViewMarkerDetails/ViewMarkerDetails';
import ActivityLogs from './components/ActivityLogs/ActivityLogs';
import UserActivityLog from './components/UserActivityLog/UserActivityLog';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/register' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path="/aboutus" element={<Aboutus />} />
        <Route path='/' element={<Home />} />
        <Route path='/map' element={<MapPage />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='*' element={<Navigate to='/not-found' />} />
        <Route path='/not-found' element={<NotFound />} />
        <Route path='/admindashboard' element={<AdminDashboard />} />
        <Route path='/accessdenied' element={<AccessDenied />} />
        <Route path='/users-managing' element={<UsersManagingPage />} />
        <Route path='/viewallusers' element={<ViewAllUsers />} />
        <Route path='/updateviewauser' element={<UpdateViewAUser />} />
        <Route path='/userinformation/:userId' element={<UserInformation />} />
        <Route path='/safezonesmanagingpage' element={<SafeZoneManagingPage />} />
        <Route path='/addsafezone' element={<AddSafeZonePage />} />
        <Route path='/viewallsafezones' element={<ViewAllSafeZones />} />
        <Route path='/viewupdatesafezone/:id' element={<ViewUpdateSafeZone />} />
        <Route path='/dangerzonesmanagingpage' element={<DangerZoneManagingPage />} />
        <Route path='/adddangerzone' element={<AddDangerZonePage />} />
        <Route path='/viewalldangerzones' element={<ViewAllDangerZones />} />
        <Route path='/viewupdatedangerzone/:id' element={<ViewUpdateDangerZonePage />} />
        <Route path="/location/:lng/:lat" element={<LocationInfoPage />} />
        <Route path="/marker/:coordinates" element={<ViewMarkerDetails />} />
        <Route path="/activitylogs" element={<ActivityLogs />} />
        <Route path="/activitylogs/useractivitylog/:username" element={<UserActivityLog />} />
        
        

      </Routes>
    </BrowserRouter>
  );
}

export default App;
