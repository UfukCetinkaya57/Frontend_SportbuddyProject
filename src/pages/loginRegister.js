import React, { useState } from 'react';
import axios from 'axios';
import '../styles/loginRegister.css';

function LoginRegister({ isLoggedIn, setLoggedIn }) {
  const [loginInfo, setLoginInfo] = useState({ userName: '', passwd: '' });
  const [registerInfo, setRegisterInfo] = useState({ firstName: '', lastName: '', userName: '', email: '', passwd: '', photoBase64: '', address: '', mobilePhone: '' });
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isRegisterDisabled, setIsRegisterDisabled] = useState(true);

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://localhost:7214/api/Auth/login', {
        userName: loginInfo.userName,
        passwd: loginInfo.passwd
      });
      
      const token = response.data.token;
      setLoggedIn(true);
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    } catch (error) {
      setPasswordError(true);
      console.error("Login error:", error);
    }
  };

  const handleRegister = async () => {
    try {
      if (!validateEmail(registerInfo.email)) {
        alert("Lütfen geçerli bir email adresi girin.");
        return;
      }
      
      const response = await axios.post('https://localhost:7214/api/Auth/register', {
        userName: registerInfo.userName,
        email: registerInfo.email,
        passwd: registerInfo.passwd,
        firstName: registerInfo.firstName,
        lastName: registerInfo.lastName,
        photoBase64: registerInfo.photoBase64,
        address: registerInfo.address,
        mobilePhone: registerInfo.mobilePhone,
        roles: 'user'
      });

      
      
      if (response.status === 200) {
        setRegistrationSuccess(true);
        alert("Kayıt başarılı!");
      } else {
        alert("Kayıt işlemi başarısız!");
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setEmailError(!validateEmail(email));
    setRegisterInfo({ ...registerInfo, email });
    setIsRegisterDisabled(!validateEmail(email));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Content = reader.result.split(';base64,')[1];
        setRegisterInfo({ ...registerInfo, photoBase64: base64Content });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="login-register-container">
      {!isLoggedIn && (
        <div className="form-container1">
          <h1>Giriş Yap</h1>
          <label>Mail:</label>
          <input
            type="email"
            value={loginInfo.userName}
            onChange={(e) => setLoginInfo({ ...loginInfo, userName: e.target.value })}
          />
          {passwordError && <p className="error-message">Kullanıcı adı veya şifre hatalı!</p>}
          <label>Şifre:</label>
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              value={loginInfo.passwd}
              onChange={(e) => setLoginInfo({ ...loginInfo, passwd: e.target.value })}
            />
            <span onClick={togglePasswordVisibility}>{showPassword ? 'Gizle' : 'Göster'}</span>
          </div>
          <button onClick={handleLogin} className='mt-3'>Giriş Yap</button>
          <p>
            Hesabınız yok mu?{' '}
            <span onClick={() => setShowRegisterModal(true)} className="register-link">
              Kayıt Ol
            </span>
          </p>
        </div>
      )}

      {showRegisterModal && (
        <div className="modal-overlay1">
          <div className="modal1">
            <h1>Kayıt Ol</h1>
            <label>Ad:</label>
            <input
              type="text"
              value={registerInfo.firstName}
              onChange={(e) => setRegisterInfo({ ...registerInfo, firstName: e.target.value })}
            />
            <label>Soyad:</label>
            <input
              type="text"
              value={registerInfo.lastName}
              onChange={(e) => setRegisterInfo({ ...registerInfo, lastName: e.target.value })}
            />
            <label>Kullanıcı Adı:</label>
            <input
              type="text"
              value={registerInfo.userName}
              onChange={(e) => setRegisterInfo({ ...registerInfo, userName: e.target.value })}
            />
            <label>Email:</label>
            <input
              type="email"
              value={registerInfo.email}
              onChange={handleEmailChange}
              className={emailError ? 'error' : ''}
            />
            {emailError && <p className="error-message">Geçerli bir email girin</p>}
            <label>Şifre:</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                value={registerInfo.passwd}
                onChange={(e) => setRegisterInfo({ ...registerInfo, passwd: e.target.value })}
              />
              <span onClick={togglePasswordVisibility}>{showPassword ? 'Gizle' : 'Göster'}</span>
            </div>
            <label>Fotoğraf:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
            <label>Adres:</label>
            <input
              type="text"
              value={registerInfo.address}
              onChange={(e) => setRegisterInfo({ ...registerInfo, address: e.target.value })}
            />
            <label>Cep Telefonu:</label>
            <input
              type="text"
              value={registerInfo.mobilePhone}
              onChange={(e) => setRegisterInfo({ ...registerInfo, mobilePhone: e.target.value })}
            />
            <button onClick={handleRegister} className='mt-1' disabled={isRegisterDisabled}>Kayıt Ol</button>
            <p>
              Zaten bir hesabınız mı var?{' '}
              <span onClick={() => setShowRegisterModal(false)} className="login-link">
                Giriş Yap
              </span> 
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginRegister;
