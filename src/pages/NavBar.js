import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import profil from '../assets/person-square.svg';
import basket from '../assets/cart-fill.svg';
import axios from 'axios';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState(""); // Kullanıcının id'sini saklayacak state

  useEffect(() => {
    // Kullanıcının id'sini al
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = decodeToken(token);
      setUserId(decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);
    }
  }, []);

  useEffect(() => {
    // Kullanıcının rolünü al
    if (userId) {
      axios.get(`https://localhost:7214/api/Profile/getProfileById?userId=${userId}`)
        .then(response => {
          const roles = response.data.roles;
          setIsAdmin(roles && roles.includes('admin'));
        })
        .catch(error => {
          console.error('Error fetching user profile:', error);
        });
    }
  }, [userId]);

  const decodeToken = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));

    return JSON.parse(jsonPayload);
  };

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <style jsx>{`
        .bg-blue {
          background-color: #0e4581; /* Daha koyu mavi */
        }
        .nav-item .nav-link {
          color: #fff; /* NavItem text rengi beyaz */
        }
      `}</style>
      <nav className={`navbar navbar-expand-lg ${isAdmin ? 'navbar-light bg-blue' : 'navbar-dark bg-success'} fixed-top`}>
        <div className="container-fluid">
          <Link className="navbar-brand text-white" to="/anaekran">Spor Arkadaşım</Link>
          <button className="navbar-toggler" type="button" onClick={toggleNavbar}>
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <NavItem to="/sporlar" text="Sporlar" />
              <NavItem to="/magaza" text="Mağaza" />
              <NavItem to="/etkinlik" text="Etkinlikler" />
              {isAdmin && <NavItem to="/kullanici" text="Kullanıcılar" />} {/* Sadece admin ise göster */}
              {isAdmin && <NavItem to="/adminürün" text="Admin Ürün" />}
              {isAdmin && <NavItem to="/adminetkinlik" text="Admin Etkinlik" />}
              {isAdmin && <NavItem to="/adminmesaj" text="Admin Mesaj" />}
            </ul>
            {isAdmin && <p className="text-white mb-0 me-5">ADMİN PANELİ</p>}
            <div className="d-flex align-items-center">
              <Link className="nav-link" to="/basket">
                <img src={basket} alt="Basket Icon" width="24" height="24" />
              </Link>
              <div className="mx-2"></div> {/* Mesafe ekleyen boş div */}
              <Link className="nav-link" to="/profile">
                <img src={profil} alt="Profile Icon" width="24" height="24" />
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

const NavItem = ({ to, text }) => {
  return (
    <li className="nav-item">
      <Link className="nav-link" to={to}>{text}</Link>
    </li>
  );
};

export default NavBar;
