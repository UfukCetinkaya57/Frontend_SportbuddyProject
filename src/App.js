import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sporlar from './pages/Sporlar';
import AnaEkran from './pages/anaekran';
import LoginRegister from './pages/loginRegister';
import './App.css';
import NavBar from './pages/NavBar';
import İlanVer from './pages/İlanVer';
import Profile from './pages/profile';
import Message from './pages/message';
import Shop from './pages/Shop';
import Mağaza from './pages/Mağaza';
import EtkinlikKatil from './pages/etkinliğeKatil';
import Kredi from './pages/creditcart';
import Basket from './pages/basket';
import Kullanici from './pages/kullancılar';
import Admin1 from './pages/adminÜrün';
import Admin2 from './pages/adminEtkinlik';
import Admin3 from './pages/adminMesaj';
import ProfileEdit from './pages/profileEdit'; // Yeni bileşenin eklenmesi

function App() {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
  };

  return (
    <Router>
      <div className="container-fluid  d-flex justify-content-center align-items-center p-0 m-0" style={{ minHeight: '100vh' }}>
        {!isLoggedIn ? (
          <LoginRegister setLoggedIn={setLoggedIn} />
        ) : (
          <div className="w-100">
            <NavBar />
            <Routes>
              <Route path="/" element={<Navigate to="/anaekran" />} />
              <Route path="/anaekran" element={<AnaEkran />} />
              <Route path="/sporlar" element={<Sporlar />} />
              <Route path="/ilanver" element={<İlanVer />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit/:userId" element={<ProfileEdit />} /> {/* Yeni bileşenin rotası */}
              <Route path="/message/:activityId" element={<Message />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/magaza" element={<Mağaza addToCart={addToCart} />} />
              <Route path="/etkinlik" element={<EtkinlikKatil />} />
              <Route path="/kredi" element={<Kredi />} />
              <Route path="/basket" element={<Basket cartItems={cartItems} />} />
              <Route path="/kullanici" element={<Kullanici />} />
              <Route path="/adminürün" element={<Admin1 />} />
              <Route path="/adminetkinlik" element={<Admin2 />} />
              <Route path="/adminmesaj" element={<Admin3 />} />
              <Route path="/login" element={<LoginRegister />} />
            </Routes>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
