import React, { Component } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

class ProfileEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      firstName: '',
      lastName: '',
      email: '',
      address: '',
      mobilePhone: '',
      password: '', // Şifre alanı eklendi
      confirmPassword: '', // Şifreyi onaylamak için alan
      roles: '',
      photoBase64: '',
      originalPhotoBase64: '',
      photoName: '',
      errorMessage: '',
      passwdSalt: '', // Kullanıcı verilerinden alınan şifre salt değeri
      passwdHash: '', // Kullanıcı verilerinden alınan şifre hash değeri
    };
  }

  componentDidMount() {
    const { userId } = this.props.params;
    this.setState({ userId: userId });

    axios.get(`https://localhost:7214/api/Auth/getUserById?userId=${userId}`)
      .then(response => {
        const userData = response.data;
        this.setState({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          address: userData.address,
          mobilePhone: userData.mobilePhone,
          roles: userData.roles,
          photoBase64: userData.photoBase64,
          originalPhotoBase64: userData.photoBase64,
          photoName: userData.photoPath ? userData.photoPath.split('/').pop() : '', // Dosya adını ayıklama
          passwdSalt: userData.passwdSalt, // passwdSalt ve passwdHash değerlerini al
          passwdHash: userData.passwdHash,
        });
      })
      .catch(error => {
        console.error('Kullanıcı bilgileri alınırken bir hata oluştu:', error);
        this.setState({ errorMessage: 'Kullanıcı bilgileri alınırken bir hata oluştu.' });
      });
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      this.setState({ 
        photoBase64: reader.result.split(',')[1], // Sadece base64 verisini al
        photoName: file.name // Dosya adını alarak photoName'e atama yapabilirsiniz.
      });
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  updateUser = () => {
    const { userId, firstName, lastName, email, address, mobilePhone, password, confirmPassword, roles, photoBase64, photoName, passwdSalt, passwdHash } = this.state;

    // Şifre ve şifre onayını kontrol et
    if (password !== confirmPassword) {
      this.setState({ errorMessage: 'Şifreler uyuşmuyor.' });
      return;
    }

    let userData = {
      id: userId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      address: address,
      mobilePhone: mobilePhone,
      roles: roles,
      photoBase64: photoBase64 || null,
      photoPath: `C:/Users/emirg/OneDrive/Masaüstü/SportBuddyProject/SportBuddyWebAPI/Upload/Photos/34/UserPhoto/${photoName}`, // Sunucu tarafında tam dosya yolunu oluşturma
    };

    // Eğer şifre alanları boş değilse, güncelleme verilerine yeni şifreyi de ekle
    if (password.trim() !== '') {
      userData.password = password;
    } else {
      // Şifre alanları boş bırakıldıysa, mevcut şifresi ve hash değeri eklenir
      userData.passwdSalt = passwdSalt;
      userData.passwdHash = passwdHash;
    }

    axios.put('https://localhost:7214/api/Auth/UpdateUser', userData)
    .then(response => {
      // Güncelleme başarılı ise burada gerekli işlemleri yapabilirsiniz
      console.log('Kullanıcı başarıyla güncellendi');
    })
    .catch(error => {
      console.error('Kullanıcı güncellenirken bir hata oluştu:', error);
      this.setState({ errorMessage: 'Kullanıcı güncellenirken bir hata oluştu.' });
    });
  }

  render() {
    return (
      <div className="container">
        <h2>Profilini Düzenle</h2>
        <form>
          <div className="form-group">
            <label>İsim</label>
            <input type="text" name="firstName" value={this.state.firstName} onChange={this.handleInputChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Soyisim</label>
            <input type="text" name="lastName" value={this.state.lastName} onChange={this.handleInputChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={this.state.email} onChange={this.handleInputChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Adres</label>
            <input type="text" name="address" value={this.state.address} onChange={this.handleInputChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Telefon Numarası</label>
            <input type="text" name="mobilePhone" value={this.state.mobilePhone} onChange={this.handleInputChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Şifre  (Şifrenizi değiştirmek istemiyorsanız boş bırakın)</label>
            <input type="password" name="password" value={this.state.password} onChange={this.handleInputChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Şifre Onayı</label>
            <input type="password" name="confirmPassword" value={this.state.confirmPassword} onChange={this.handleInputChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Profil Fotoğrafı</label>
            <input type="file" name="photo" onChange={this.handleFileChange} className="form-control" />
          </div>
          {this.state.errorMessage && (
            <div className="text-danger">{this.state.errorMessage}</div>
          )}
          <button type="button" onClick={this.updateUser} className="btn btn-primary">Güncelle</button>
        </form>
      </div>
    );
  }
}

const ProfileEditWithParams = (props) => {
  const params = useParams();
  return <ProfileEdit {...props} params={params} />;
};

export default ProfileEditWithParams;
