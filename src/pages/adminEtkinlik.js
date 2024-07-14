import React, { Component } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

export default class AdminEtkinlik extends Component {
  constructor(props) {
    super(props);
    this.state = {
      etkinlikler: [],
      error: null,
      isAdmin: false,
      currentPage: 1, // Mevcut sayfa numarası
      etkinliklerPerPage: 5, // Sayfa başına gösterilecek etkinlik sayısı
      showFilter: false, // Filtrenin görünürlüğü
      etkinlikAdiFilter: '', // Etkinlik adı filtresi
      etkinlikYeriFilter: '', // Etkinlik yeri filtresi
      etkinlikAciklamaFilter: '' // Etkinlik açıklaması filtresi
    };
  }

  componentDidMount() {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.decodeToken(token);
      const userId = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      this.fetchUserProfile(userId);
    }

    this.fetchEtkinlikler();
  }

  fetchUserProfile = (userId) => {
    axios.get(`https://localhost:7214/api/Profile/getProfileById?userId=${userId}`)
      .then(response => {
        const roles = response.data.roles;
        const isAdmin = roles && roles.includes('admin');
        this.setState({ isAdmin });
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
      });
  }

  decodeToken = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));

    return JSON.parse(jsonPayload);
  };

  fetchEtkinlikler = () => {
    axios.get('https://localhost:7214/api/Activity/getAllActivities')
      .then(response => {
        this.setState({ etkinlikler: response.data });
      })
      .catch(error => {
        this.setState({ error });
      });
  }

  handleSil = (etkinlikId) => {
    axios.delete(`https://localhost:7214/api/Activity/DeleteActivity?activityId=${etkinlikId}`)
      .then(response => {
        console.log('Etkinlik silindi:', response.data);
        this.fetchEtkinlikler(); // Silindikten sonra etkinlikleri yeniden getir
      })
      .catch(error => {
        console.error('Etkinlik silinirken hata oluştu:', error);
      });
  };

  // Sayfa değiştirme işlevi
  paginate = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  }

  // Filtreleme formunu göster/gizle
  toggleFilter = () => {
    this.setState(prevState => ({
      showFilter: !prevState.showFilter
    }));
  }

  // Filtreleme işlemini gerçekleştir
  filterEtkinlikler = () => {
    const { etkinlikler, etkinlikAdiFilter, etkinlikYeriFilter, etkinlikAciklamaFilter } = this.state;
    return etkinlikler.filter(etkinlik =>
      etkinlik.activityName.toLowerCase().includes(etkinlikAdiFilter.toLowerCase()) &&
      etkinlik.activityMap.toLowerCase().includes(etkinlikYeriFilter.toLowerCase()) &&
      etkinlik.activityDescription.toLowerCase().includes(etkinlikAciklamaFilter.toLowerCase())
    );
  }

  render() {
    const { error, isAdmin, currentPage, etkinliklerPerPage, showFilter } = this.state;

    if (!isAdmin) {
      return <div>Erişim izniniz yok.</div>;
    }

    if (error) {
      return <div className="alert alert-danger">Hata: {error.message}</div>;
    }

    // Filtrelenmiş etkinlikleri al
    const currentFilteredEtkinlikler = this.filterEtkinlikler();

    // Sayfa sayılarını hesaplama
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(currentFilteredEtkinlikler.length / etkinliklerPerPage); i++) {
      pageNumbers.push(i);
    }

    // Mevcut sayfadaki etkinlikleri al
    const indexOfLastEtkinlik = currentPage * etkinliklerPerPage;
    const indexOfFirstEtkinlik = indexOfLastEtkinlik - etkinliklerPerPage;
    const currentEtkinlikler = currentFilteredEtkinlikler.slice(indexOfFirstEtkinlik, indexOfLastEtkinlik);

    return (
      <div className="container mt-4">
        <h1 className="mt-4">Tüm Etkinlikler</h1>
        <div className="filter-form">
          <div className="filter-header mb-3 mt-3" onClick={this.toggleFilter}>
            <FontAwesomeIcon icon={faFilter} /> Filtrele
          </div>
          {showFilter && (
            <div>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Etkinlik Adı "
                value={this.state.etkinlikAdiFilter}
                onChange={e => this.setState({ etkinlikAdiFilter: e.target.value })}
              />
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Etkinlik Yeri "
                value={this.state.etkinlikYeriFilter}
                onChange={e => this.setState({ etkinlikYeriFilter: e.target.value })}
              />
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Etkinlik Açıklaması "
                value={this.state.etkinlikAciklamaFilter}
                onChange={e => this.setState({ etkinlikAciklamaFilter: e.target.value })}
              />
            </div>
          )}
        </div>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Etkinlik Adı</th>
                <th>Açıklama</th>
                <th>Tür</th>
                <th>Yer</th>
                <th>Tarih</th>
                <th>Kapasite</th>
                <th>Katılımcılar</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {currentEtkinlikler.map(etkinlik => (
                <tr key={etkinlik.activityId}>
                  <td>{etkinlik.activityId}</td>
                  <td>{etkinlik.activityName}</td>
                  <td>{etkinlik.activityDescription}</td>
                  <td>{etkinlik.activityType}</td>
                  <td>{etkinlik.activityMap}</td>
                  <td>{etkinlik.activityDate}</td>
                  <td>{etkinlik.numberOfUsersRequestedForTheEvent}</td>
                  <td>{etkinlik.usersIdList}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => this.handleSil(etkinlik.activityId)}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Sayfalama butonları */}
        <nav>
          <ul className="pagination">
            {pageNumbers.map(number => (
              <li key={number} className="page-item">
                <button onClick={() => this.paginate(number)} className="page-link">
                  {number}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  }
}
