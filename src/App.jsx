import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup/Signup';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import Aboutus from './components/Aboutus/Aboutus';
import NotFound from './components/NotFound/NotFound';
import ForgotPassword from './components/FrogotPassword/ForgotPassword';
import MapPage from './components/MapPage/MapPage';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
