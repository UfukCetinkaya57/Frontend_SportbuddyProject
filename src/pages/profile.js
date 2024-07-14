import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/profile.css";

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: "",
      firstName: "",
      lastName: "",
      email: "",
      profileImage: "",
      roles: "",
      address: "",
      mobilePhone: "",
      passwordHash: "",
      passwordSalt: "",
      newPassword: "",
      confirmPassword: "",
      errorMessage: "",
    };
  }

  componentDidMount() {
    // Profil bilgilerini API'den al
    this.fetchProfile();
  }

  fetchProfile() {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = this.decodeToken(token);
      this.setState({
        userId:
          decodedToken[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ],
      });
      axios
        .get(
          "https://localhost:7214/api/Auth/getUserById?userId=" +
            decodedToken[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ]
        )
        .then((response) => {
          this.setState({
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
            profileImage: "data:image/jpeg;base64," + response.data.photoBase64,
            roles: response.data.roles,
            address: response.data.address,
            mobilePhone: response.data.mobilePhone,
            passwordHash: response.data.passwordHash,
            passwordSalt: response.data.passwordSalt,
          });
        })
        .catch((error) => {
          console.error("Profil bilgileri alınırken bir hata oluştu:", error);
        });
    }
  }

  decodeToken(token) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  }

  handleLogout = () => {
    localStorage.removeItem("token"); // Token'ı kaldır
    window.location.href = "/"; // Ana sayfaya yönlendir
  };

  render() {
    return (
      <section className="h-100 gradient-custom-2">
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col col-lg-9 col-xl-7">
              <div className="card">
                <div className="rounded-top text-white d-flex flex-row" style={{ backgroundColor: "#208454" }}>
                  <div className="profile-image-wrapper ms-4 mt-5" style={{ width: "150px" }}>
                    <img src={this.state.profileImage} alt="Profile" className="img-fluid img-thumbnail mt-4 mb-2" style={{ width: "100%" }} />
                    
                  </div>
                  <div className="profile-succes ms-3" style={{ marginTop: "130px", color: "white"  ,backgroundColor: "#208454"  }}>
                    <h5 style={{ color: "white" }}>{this.state.firstName} {this.state.lastName}</h5>
                  </div>
                </div>
                <div className="p-4 text-black" style={{ backgroundColor: "#208454" }}>
                  <div className="d-flex justify-content-end text-center py-1"></div>
                </div>
                <div className="card-body p-4 text-black">
                  <div className="profile-details">
                    <p><strong>Gmail:</strong> {this.state.email}</p>
                    <p><strong>Adres:</strong> {this.state.address}</p>
                    <p><strong>Telefon:</strong> {this.state.mobilePhone}</p>
                  </div>
                  <div className="dropdown mb-2">
                      <Link to={`/profile/edit/${this.state.userId}`} className="btn btn-secondary">Profilini Düzenle</Link> <br></br>
                      {this.state.roles.includes("admin") && <Link to="/shop" className="shop-link">Ürünleri Sat</Link>}<br></br>
                      <button onClick={this.handleLogout} className="btn btn-danger btn-sm">Çıkış Yap</button> <br></br>
                    </div>
                  {this.state.errorMessage && (
                    <div className="row g-2">
                      <div className="col text-danger">
                        {this.state.errorMessage}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
