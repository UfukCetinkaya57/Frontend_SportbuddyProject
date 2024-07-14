import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

export default class AdminMesaj extends Component {
  state = {
    messages: [],
    groupedMessages: {},
    selectedActivityId: null,
    isAdmin: false,
    nameFilter: '',
    idFilter: '',
    isFilterOpen: false,
    currentPage: 1,
    activitiesPerPage: 6,
    messagesPerPage: 4
  };

  componentDidMount() {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.decodeToken(token);
      const userId = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      this.fetchUserProfile(userId);
    }
  }

  fetchUserProfile = (userId) => {
    fetch(`https://localhost:7214/api/Profile/getProfileById?userId=${userId}`)
      .then(response => response.json())
      .then(profile => {
        const roles = profile.roles;
        const isAdmin = roles && roles.includes('admin');
        this.setState({ isAdmin });
        if (isAdmin) {
          this.fetchMessages();
        }
      })
      .catch(error => console.error('Error fetching user profile:', error));
  }

  fetchMessages = () => {
    fetch('https://localhost:7214/api/Messages/getAllMessage')
      .then(response => response.json())
      .then(data => {
        const sortedMessages = data.sort((a, b) => new Date(b.messageSendDate) - new Date(a.messageSendDate));
        this.setState({ messages: sortedMessages });

        const groupedMessages = sortedMessages.reduce((acc, message) => {
          const { activityId } = message;
          if (!acc[activityId]) {
            acc[activityId] = {
              activityName: '',
              activityMessages: []
            };
          }
          acc[activityId].activityMessages.push(message);
          return acc;
        }, {});

        this.setState({ groupedMessages });

        // Etkinlik adlarını getir
        Object.keys(groupedMessages).forEach(activityId => {
          this.fetchActivityName(activityId);
        });
      })
      .catch(error => console.error('Error fetching messages:', error));
  }

  fetchActivityName = (activityId) => {
    fetch(`https://localhost:7214/api/Activity/getActivityById?userId=${activityId}`)
      .then(response => response.json())
      .then(data => {
        const activityName = data.activityName;
        this.setState(prevState => ({
          groupedMessages: {
            ...prevState.groupedMessages,
            [activityId]: {
              ...prevState.groupedMessages[activityId],
              activityName: activityName
            }
          }
        }));
      })
      .catch(error => console.error('Error fetching activity name:', error));
  }

  handleClick = (activityId) => {
    this.setState(prevState => ({
      selectedActivityId: prevState.selectedActivityId === activityId ? null : activityId
    }));
  }

  handleDelete = (messageId) => {
    fetch(`https://localhost:7214/api/Messages/deleteMessage?id=${messageId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      }
    })
    .then(response => {
      if (response.ok) {
        this.setState(prevState => {
          const updatedMessages = prevState.messages.filter(message => message.messageId !== messageId);
          const updatedGroupedMessages = {};
          Object.keys(prevState.groupedMessages).forEach(key => {
            updatedGroupedMessages[key] = {
              ...prevState.groupedMessages[key],
              activityMessages: prevState.groupedMessages[key].activityMessages.filter(message => message.messageId !== messageId)
            };
          });
          return {
            messages: updatedMessages,
            groupedMessages: updatedGroupedMessages
          };
        });
      } else {
        throw new Error('Mesaj silinemedi.');
      }
    })
    .catch(error => console.error('Error deleting message:', error));
  }

  handleNameFilterChange = (event) => {
    this.setState({ nameFilter: event.target.value });
  }

  handleIdFilterChange = (event) => {
    this.setState({ idFilter: event.target.value });
  }

  handleFilterToggle = () => {
    this.setState(prevState => ({
      isFilterOpen: !prevState.isFilterOpen
    }));
  }

  decodeToken = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));

    return JSON.parse(jsonPayload);
  };

  paginate = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  }

  render() {
    const { groupedMessages, selectedActivityId, isAdmin, currentPage, activitiesPerPage, nameFilter, idFilter, isFilterOpen } = this.state;

    if (!isAdmin) {
      return <div>Erişim izniniz yok.</div>;
    }

    // Etkinlikler için indeks hesaplaması
    const indexOfLastActivity = currentPage * activitiesPerPage;
    const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;

    // Mevcut sayfadaki etkinlikleri al
    const currentActivities = Object.keys(groupedMessages).filter(activityId => {
      const activityName = groupedMessages[activityId].activityName.toLowerCase();
      const activityIdFiltered = activityId.includes(idFilter.toLowerCase());
      const nameFiltered = activityName.includes(nameFilter.toLowerCase());
      return activityIdFiltered && nameFiltered;
    }).slice(indexOfFirstActivity, indexOfLastActivity);

    // Sayfa sayılarını hesapla
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(Object.keys(groupedMessages).length / activitiesPerPage); i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="container">
        <div className="filter-header mt-5 mb-3" onClick={this.handleFilterToggle}>
          <FontAwesomeIcon icon={faFilter} /> Filtrele
        </div>
        {isFilterOpen && (
          <div className="filter-form">
            <div className="mb-3">
              <label htmlFor="nameFilterInput">İsme Göre Filtrele:</label>
              <input
                id="nameFilterInput"
                type="text"
                className="form-control"
                value={nameFilter}
                onChange={this.handleNameFilterChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="idFilterInput">ID'ye Göre Filtrele:</label>
              <input
                id="idFilterInput"
                type="text"
                className="form-control"
                value={idFilter}
                onChange={this.handleIdFilterChange}
              />
            </div>
          </div>
        )}
        {/* Aktiviteler için kartları oluştur */}
        <div className="row">
          {currentActivities.map(activityId => (
            <div key={activityId} className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{groupedMessages[activityId].activityName}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">Etkinlik ID: {activityId}</h6>
                  <button className="btn btn-primary" onClick={() => this.handleClick(activityId)}>
                    Mesajları Göster
                  </button>
                </div>
                {selectedActivityId === activityId && (
                  <div className="card-body overflow-auto" style={{ maxHeight: "300px" }}>
                    <ul className="list-group">
                      {groupedMessages[activityId].activityMessages.map(message => (
                        <li key={message.messageId} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <p className="mb-0">Mesaj: {message.messageContent}</p>
                              <p className="mb-0">Gönderim Tarihi: {message.messageSendDate}</p>
                              <p className="mb-0">User ID: {message.userId}</p>
                            </div>
                            <button className="btn btn-danger" onClick={() => this.handleDelete(message.messageId)}>
                              Sil
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
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
