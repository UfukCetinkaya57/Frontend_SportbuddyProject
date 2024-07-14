import React, { Component } from 'react';
import axios from 'axios';

export default class EtkinlikOlustur extends Component {
  constructor(props) {
    super(props);
    this.state = {
      etkinlikAdi: '',
      aciklama: '',
      spor: '',
      konum: '',
      tarih: '',
      kisiSayisi: 0,
      userId: '',
      yeniEtkinlikGirildi: false
    };
  }

  componentDidMount() {
    // Tokeni al
    const token = localStorage.getItem('token');
    if (token) {
      // Tokeni çözerek kullanıcı kimliğini al
      const userId = this.decodeToken(token)["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      this.setState({ userId: userId });

    }
  }

  handleEtkinlikAdiChange = (e) => {
    this.setState({ etkinlikAdi: e.target.value });
  }

  handleAciklamaChange = (e) => {
    this.setState({ aciklama: e.target.value });
  }

  handleSporChange = (e) => {
    this.setState({ spor: e.target.value });
  }

  handleKonumChange = (e) => {
    this.setState({ konum: e.target.value });
  }

  handleTarihChange = (e) => {
    this.setState({ tarih: e.target.value });
  }

  handleKisiSayisiChange = (e) => {
    this.setState({ kisiSayisi: parseInt(e.target.value) });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { etkinlikAdi, aciklama, spor, konum, tarih, kisiSayisi, userId } = this.state;
  
    // Tüm alanların dolu olduğunu kontrol et
    if (etkinlikAdi.trim() === '' || aciklama.trim() === '' || spor.trim() === '' || konum.trim() === '' || tarih.trim() === '' || kisiSayisi <= 0) {
      alert('Lütfen tüm alanları doldurun ve kişi sayısını pozitif bir değer olarak girin.');
      return;
    }
  
    // Etkinlik bilgilerini içeren bir JSON nesnesi oluştur
    const postData = {
      activityName: etkinlikAdi,
      activityDescription: aciklama,
      activityType: spor,
      activityMap: konum,
      activityDate: tarih,
      numberOfUsersRequestedForTheEvent: kisiSayisi
    };
  
    // Etkinliği oluşturmak için isteği gönder
    axios.post(`https://localhost:7214/api/Activity/AddActivity?userId=${userId}`, postData)
      .then(response => {
        console.log('Etkinlik oluşturuldu:', response.data);
        this.setState({ yeniEtkinlikGirildi: true });
        this.setState({ etkinlikAdi: '', aciklama: '', spor: '', konum: '', tarih: '', kisiSayisi: 0 });
        alert('Etkinlik başarıyla oluşturuldu!');
      })
      .catch(error => {
        console.error('Etkinlik oluşturulurken bir hata oluştu:', error);
      });
  }
  

  decodeToken(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
 
    return JSON.parse(jsonPayload);
  }

  render() {
    const { etkinlikAdi, aciklama, spor, konum, tarih, kisiSayisi, yeniEtkinlikGirildi } = this.state;

    return (
      <div className="container" style={{ backgroundColor: '#f0f0f0', padding: '20px' }}>
        <div className="row justify-content-center mt-5">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body">
                <h2 className="card-title text-center mb-4">Etkinlik Oluştur</h2>
                <form onSubmit={this.handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="etkinlikAdi" className="form-label">Etkinlik Adı</label>
                    <input type="text" className="form-control" id="etkinlikAdi" value={etkinlikAdi} onChange={this.handleEtkinlikAdiChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="aciklama" className="form-label">Açıklama</label>
                    <textarea className="form-control" id="aciklama" rows="3" value={aciklama} onChange={this.handleAciklamaChange}></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="spor" className="form-label">Spor</label>
                    <input type="text" className="form-control" id="spor" value={spor} onChange={this.handleSporChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="konum" className="form-label">Konum</label>
                    <input type="text" className="form-control" id="konum" value={konum} onChange={this.handleKonumChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="tarih" className="form-label">Tarih</label>
                    <input type="date" className="form-control" id="tarih" value={tarih} onChange={this.handleTarihChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="kisiSayisi" className="form-label">Kaç Kişiye İhtiyaç Var</label>
                    <input type="number" className="form-control" id="kisiSayisi" value={kisiSayisi} onChange={this.handleKisiSayisiChange} />
                  </div>
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary">Etkinlik Oluştur</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {yeniEtkinlikGirildi && (
            <div className="col-md-8 mt-4">
              <div className="card mb-3" style={{ backgroundColor: '#e6f7ff', borderRadius: '10px', padding: '10px' }}>
                <div className="card-body">
                  <h5 className="card-title">Etkinlik Oluşturuldu</h5>
                  <p className="card-text">Etkinlik başarıyla oluşturuldu!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
