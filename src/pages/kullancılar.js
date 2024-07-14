import React, { Component } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faCheckSquare, faSquare } from '@fortawesome/free-solid-svg-icons';
import "../styles/kullanıcı.css"

export default class Kullancılar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      filteredUsers: [],
      error: null,
      isAdmin: false,
      currentPage: 1, // Mevcut sayfa numarası
      usersPerPage: 8, // Sayfa başına gösterilecek kullanıcı sayısı
      idSearchInput: '', // ID arama girdisi
      emailSearchInput: '', // E-posta arama girdisi
      bulkIdSearchInput: '', // Toplu ID arama girdisi
      showFilter: false // Filtrenin görünürlüğü
    };
  }

  componentDidMount() {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.decodeToken(token);
      const userId = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      this.fetchUserProfile(userId);
    }

    this.fetchUsers();
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

  fetchUsers = () => {
    axios.get('https://localhost:7214/api/Auth/getAllUsers')
      .then(response => {
        this.setState({ users: response.data, filteredUsers: response.data });
      })
      .catch(error => {
        this.setState({ error });
      });
  }

  handleDeleteUser = (user) => {
    axios.delete(`https://localhost:7214/api/Auth/DeleteUser`, { data: user })
      .then(response => {
        // Kullanıcı başarıyla silindiğinde state'i güncelle
        this.setState(prevState => ({
          users: prevState.users.filter(u => u.id !== user.id),
          filteredUsers: prevState.filteredUsers.filter(u => u.id !== user.id)
        }));
      })
      .catch(error => {
        // Hata durumunda hata mesajını göster
        console.error('Silme işlemi sırasında bir hata oluştu:', error);
      });
  }

  handleRoleToggle = (userId) => {
    const newRole = 'admin';
   
    // Kullanıcının bilgilerini al
    axios.get(`https://localhost:7214/api/Auth/getUserById?userId=${userId}`)
      .then(response => {
        const user = response.data;
  
        console.log(user);
        // Roller dışındaki diğer bilgileri koru
        user.roles= newRole;
  
        
        // Kullanıcının rolünü güncelle
        axios.put('https://localhost:7214/api/Auth/UpdateUser', 
          user
        )
        .then(response => {
          // Kullanıcının rolü başarıyla güncellendiğinde state'i güncelle
          this.setState(prevState => ({
            users: prevState.users.map(u => u.id === userId ? { ...u, roles: [newRole] } : u),
            filteredUsers: prevState.filteredUsers.map(u => u.id === userId ? { ...u, roles: [newRole] } : u)
          }));
        })
        .catch(error => {
          // Hata durumunda hata mesajını göster
          console.error('Rol güncelleme işlemi sırasında bir hata oluştu:', error);
        });
      })
      .catch(error => {
        console.error('Kullanıcı bilgileri alınırken bir hata oluştu:', error);
      });
  }
  

  // Sayfa değiştirme işlevi
  paginate = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  }

  // ID arama girdisi değiştiğinde
  handleIdSearchChange = (event) => {
    const { users } = this.state;
    const idSearchInput = event.target.value;
    const filteredUsers = users.filter(user => user.id.toString().includes(idSearchInput));
    this.setState({ idSearchInput, filteredUsers });
  }

  // E-posta arama girdisi değiştiğinde
  handleEmailSearchChange = (event) => {
    const { users } = this.state;
    const emailSearchInput = event.target.value;
    const filteredUsers = users.filter(user => user.email.toLowerCase().includes(emailSearchInput.toLowerCase()));
    this.setState({ emailSearchInput, filteredUsers });
  }

  // Toplu ID arama girdisi değiştiğinde
  handleBulkIdSearchChange = (event) => {
    const { users } = this.state;
    const bulkIdSearchInput = event.target.value;
    const idArray = bulkIdSearchInput.split(',').map(id => id.trim());
    const filteredUsers = users.filter(user => idArray.includes(user.id.toString()));
    this.setState({ bulkIdSearchInput, filteredUsers });
  }

  // Filtreleme formunu göster/gizle
  toggleFilter = () => {
    this.setState(prevState => ({
      showFilter: !prevState.showFilter
    }));
  }

  render() {
    const { filteredUsers, error, isAdmin, currentPage, usersPerPage, idSearchInput, emailSearchInput, bulkIdSearchInput, showFilter } = this.state;

    if (!isAdmin) {
      return <div>Erişim izniniz yok.</div>;
    }

    if (error) {
      return <div className="alert alert-danger">Hata: {error.message}</div>;
    }

    // Mevcut sayfadaki kullanıcıları filtreleme
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    // Sayfa sayılarını hesaplama
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredUsers.length / usersPerPage); i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="container">
        <h1 className="mt-5">Kullanıcılar</h1>
        <div className="filter-form">
          <div className="filter-header mb-1" onClick={this.toggleFilter}>
            <FontAwesomeIcon icon={faFilter} /> Filtrele
          </div>
          {showFilter && (
            <div className="">
              <div className="">
                <label htmlFor="idSearchInput">ID ile arama yapın:</label>
                <input
                  id="idSearchInput"
                  type="text"
                  className="form-control"
                  value={idSearchInput}
                  onChange={this.handleIdSearchChange}
                />
              </div>
              <div>
                <label htmlFor="emailSearchInput">E-posta ile arama yapın:</label>
                <input
                  id="emailSearchInput"
                  type="text"
                  className="form-control"
                  value={emailSearchInput}
                  onChange={this.handleEmailSearchChange}
                />
              </div>
              <div>
                <label htmlFor="bulkIdSearchInput">Toplu ID ile arama yapın:</label>
                <input
                  id="bulkIdSearchInput"
                  type="text"
                  className="form-control"
                  value={bulkIdSearchInput}
                  onChange={this.handleBulkIdSearchChange}
                />
              </div>
            </div>
          )}
        </div>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ad</th>
                <th>Soyad</th>
                <th>Kullanıcı Adı</th>
                <th>E-posta</th>
                <th>Adres</th>
                <th>Telefon</th>
                <th>Rol</th>
                <th></th> {/* Sil butonu için boş bir th ekleyin */}
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.userName}</td>
                  <td>{user.email}</td>
                  <td>{user.address}</td>
                  <td>{user.mobilePhone}</td>
                  <td>
                    <button
                      className="btn btn-link"
                      onClick={() => this.handleRoleToggle(user.id)}
                    >
                      {user.roles && user.roles.includes('admin') ? (
                        <FontAwesomeIcon icon={faCheckSquare} />
                      ) : (
                        <FontAwesomeIcon icon={faSquare} />
                      )}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => this.handleDeleteUser(user)}
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
