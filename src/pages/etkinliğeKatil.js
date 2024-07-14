    import React, { useState, useEffect } from 'react';
    import axios from 'axios';
    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
    import { faCalendarAlt, faMapMarkerAlt, faUser, faCheckCircle, faChair, faUserPlus, faUsers, faEnvelope, faFilter } from '@fortawesome/free-solid-svg-icons';
    import { useNavigate } from 'react-router-dom';
    import '../styles/etkinlik.css';
    import { Link } from 'react-router-dom';

    function countUsers(str) {
      try {
        const listString = str.slice(1, -1);
        const numbers = listString.split(',');
        return numbers.filter(item => item.trim().length > 0).length;
      } catch (error) {
        console.error('Kullanıcı sayısını hesaplama hatası:', error);
        return 0;
      }
    }

    const EtkinlikKatil = () => {
      const [etkinlikler, setEtkinlikler] = useState([]);
      const [userId, setUserId] = useState(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [cityFilter, setCityFilter] = useState('');
      const [startDate, setStartDate] = useState('');
      const [endDate, setEndDate] = useState('');
      const [refreshPage, setRefreshPage] = useState(false); // Yenileme state'i
      const [filterOpen, setFilterOpen] = useState(false); // Filtreleme panelinin açık/kapalı durumu
      const navigate = useNavigate();

      useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = decodeToken(token);
          const userId = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
          setUserId(userId);
        }

        axios.get('https://localhost:7214/api/Activity/getAllActivities')
          .then(response => {
            setEtkinlikler(response.data);
          })
          .catch(error => {
            console.error('Etkinlikler alınırken bir hata oluştu:', error);
          });
      }, [refreshPage]); // refreshPage state'i değiştiğinde yenileme işlemini tetikle

      const handleKatilmaDurumuChange = (activityId, katilmaDurumu) => {
        if (userId) {
          const etkinlik = etkinlikler.find(etkinlik => etkinlik.activityId === activityId);
          if (etkinlik) {
            const kalanYer = etkinlik.numberOfUsersRequestedForTheEvent - countUsers(etkinlik.usersIdList);

            if (kalanYer === 0) {
              alert('Kapasite doldu.');
              return;
            }

            if (etkinlik.usersIdList && etkinlik.usersIdList.includes(userId)) {
              alert('Bu etkinliğe zaten katıldınız.');
              return;
            }

            axios.post(`https://localhost:7214/api/Activity/JoinTheActivity?activityId=${activityId}&userId=${userId}`)
              .then(response => {
                console.log(`Activity ID ${activityId} katılım isteği gönderildi.`);
                setRefreshPage(prevState => !prevState); // Yenileme işlemini tetikle
              })
              .catch(error => {
                console.error(`Activity ID ${activityId} için katılma isteği gönderilirken bir hata oluştu:`, error);
              });
          }
        } else {
          alert('Giriş yapmadınız.');
        }
      }

      const decodeToken = (token) => {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
      }

      const handleMesajlasmaClick = (activityId) => {
        navigate(`/message/${activityId}`);
      }

      const getKatilmaDurumuMessage = (etkinlik) => {
        const katildiMi = etkinlik.usersIdList && etkinlik.usersIdList.includes(userId);

        if (katildiMi) {
          return <button className="btn btn-danger" onClick={() => handleMesajlasmaClick(etkinlik.activityId)}>Mesajlaş</button>;
        }

        const kalanYer = etkinlik.numberOfUsersRequestedForTheEvent - countUsers(etkinlik.usersIdList);
        const katilmaButonuStili = kalanYer === 0 && !katildiMi ? { backgroundColor: 'gray' } : null;
        const katilmaButonuMetni = kalanYer === 0 && !katildiMi ? 'Kapasite Dolu' : 'Katıl';

        return <button className="btn btn-success" style={katilmaButonuStili} onClick={() => handleKatilmaDurumuChange(etkinlik.activityId, "katıl")}>{katilmaButonuMetni}</button>;
      }

      // Etkinlikleri filtrelemek için işlev
      const filteredEtkinlikler = etkinlikler.filter(etkinlik => {
        return (
          etkinlik.activityName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (cityFilter === '' || etkinlik.activityMap.toLowerCase().includes(cityFilter.toLowerCase())) &&
          (startDate === '' || etkinlik.activityDate >= startDate) &&
          (endDate === '' || etkinlik.activityDate <= endDate)
        );
      });

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'activityName') {
          setSearchTerm(value);
        } else if (name === 'cityFilter') {
          setCityFilter(value);
        }
      };

      const handleDateChange = (e) => {
        const { name, value } = e.target;
        if (name === 'startDate') {
          setStartDate(value);
        } else if (name === 'endDate') {
          setEndDate(value);
        }
      };

      const toggleFilter = () => {
        setFilterOpen(!filterOpen);
      };

      return (
        <div className="container">
          <h2 className="text-center etkinlik-baslik">Etkinliklere Katıl</h2>
          {/* Filtreleme formu */}
          <div className="filter-form">
            <div className="filter-header mb-3 mt-4" onClick={toggleFilter}>
            
              <Link to="/ilanver" className="btn btn-success btn-sm" data-mdb-ripple-color="dark" style={{ zIndex: 1 }}>
                Etkinlik Oluştur
              </Link>
              <br /><br />
              <FontAwesomeIcon icon={faFilter} /> Filtrele 
              
            </div>
            {filterOpen && (
              <div>
                <div className="form-group">
                  <label>Etkinlik Adı:</label>
                  <input type="text" className="form-control" name="activityName" value={searchTerm} onChange={handleInputChange} />
                </div>
                <div className="form-group mb-3">
                  <label>Şehir:</label>
                  <input type="text" className="form-control " name="cityFilter" value={cityFilter} onChange={handleInputChange} />
                </div>
                <div className="form-group mb-3">
                  <label>Başlangıç Tarihi:</label>
                  <input type="date" className="form-control " name="startDate" value={startDate} onChange={handleDateChange} />
                </div>
                <div className="form-group mb-3">
                  <label>Bitiş Tarihi:</label>
                  <input type="date" className="form-control" name="endDate" value={endDate} onChange={handleDateChange} />
                </div>
              </div>
            )}
          </div>
          <div className="row">
            {filteredEtkinlikler.map(etkinlik => (
              <div key={etkinlik.activityId} className="col-md-4 mb-4">
                <div className="card bg-light bg-gradient">
                  <div className="card-body">
                    <h5 className="card-title">{etkinlik.activityName}</h5>
                    <p className="card-text"><strong>Oluşturan Kullanıcı:</strong> {etkinlik.usersIdList && JSON.parse(etkinlik.usersIdList)[0]}</p>

                    <div className="icon-container">
                      <FontAwesomeIcon icon={faCalendarAlt} className="icon" />
                      <p className="card-text">{etkinlik.activityDate}</p>
                    </div>
                    <div className="icon-container">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="icon" />
                      <p className="card-text">{etkinlik.activityMap}</p>
                    </div>
                    <div className="icon-container">
                      <FontAwesomeIcon icon={faUsers} className="icon" />
                      <p className="card-text">
                        <span>Katılımcı Talepleri:</span> {etkinlik.numberOfUsersRequestedForTheEvent}
                      </p>
                    </div>
                    <div className="icon-container">
                      <FontAwesomeIcon icon={faUserPlus} className="icon" />
                      <p className="card-text">
                        <span>Katılan Kullanıcı Sayısı:</span> {countUsers(etkinlik.usersIdList)}
                      </p>
                    </div>
                    <div className="icon-container">
                      <FontAwesomeIcon icon={faChair} className="icon" />
                      <p className="card-text">
                        <span>Kalan Yer:</span> {Math.max(etkinlik.numberOfUsersRequestedForTheEvent - countUsers(etkinlik.usersIdList), 0)}
                      </p>
                    </div>
                    {getKatilmaDurumuMessage(etkinlik)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    export default EtkinlikKatil;
