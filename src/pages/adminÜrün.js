import React, { Component } from 'react';
import axios from 'axios';

export default class AdminUrun extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      error: null,
      isAdmin: false,
      currentPage: 1,
      productsPerPage: 6,
      showSoldProducts: false,
      showAvailableProducts: false,
      showTotalProfit: false
    };
  }

  componentDidMount() {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.decodeToken(token);
      const userId = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      this.fetchUserProfile(userId);
    }

    this.fetchProducts();
  }

  decodeToken = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));

    return JSON.parse(jsonPayload);
  };

  fetchUserProfile = (userId) => {
    axios.get(`https://localhost:7214/api/Profile/getProfileById?userId=${userId}`)
      .then(response => {
        const roles = response.data.roles;
        const isAdmin = roles && roles.includes('admin');
        this.setState({ isAdmin });
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
        this.setState({ isAdmin: false });
      });
  }

  fetchProducts = () => {
    axios.get('https://localhost:7214/api/Products/getAllProduct')
      .then(response => {
        this.setState({ products: response.data });
      })
      .catch(error => {
        this.setState({ error });
      });
  }

  handleDeleteProduct = (productId) => {
    axios.post(`https://localhost:7214/api/Products/deleteProduct?id=${productId}`)
      .then(response => {
        this.setState(prevState => ({
          products: prevState.products.filter(product => product.id !== productId)
        }));
      })
      .catch(error => {
        console.error('Silme işlemi sırasında bir hata oluştu:', error);
      });
  }

  paginate = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  }

  handleRadioChange = (e) => {
    if (e.target.value === "sold") {
      this.setState({ showSoldProducts: true, showAvailableProducts: false, showTotalProfit: false });
    } else if (e.target.value === "available") {
      this.setState({ showSoldProducts: false, showAvailableProducts: true, showTotalProfit: false });
    } else if (e.target.value === "totalProfit") {
      this.setState({ showSoldProducts: false, showAvailableProducts: false, showTotalProfit: true });
    }
  }

  calculateTotalProfit = () => {
    const { products } = this.state;
    let totalProfit = 0;
    products.forEach(product => {
      if (product.isSale === "true") {
        totalProfit += parseFloat(product.price);
      }
    });
    return totalProfit.toFixed(2);
  }

  render() {
    const { products, error, isAdmin, currentPage, productsPerPage, showSoldProducts, showAvailableProducts, showTotalProfit } = this.state;

    if (!isAdmin) {
      return <div>Erişim izniniz yok.</div>;
    }

    if (error) {
      return <div className="alert alert-danger">Hata: {error.message}</div>;
    }

    let filteredProducts = products;
    if (showSoldProducts) {
      filteredProducts = products.filter(product => product.isSale === "true");
    } else if (showAvailableProducts) {
      filteredProducts = products.filter(product => product.isSale !== "true");
    }

    // Ürünlerin sayfalara bölünmesi
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    // Sayfa sayılarını hesaplama
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredProducts.length / productsPerPage); i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="container mt-4">
        <h1 className="mt-4 ">Mağazadaki Ürünler</h1>
        <div className="form-check form-check-inline">
          <input className="form-check-input" type="radio" name="productType" id="allProducts" value="all" checked={!showSoldProducts && !showAvailableProducts && !showTotalProfit} onChange={this.handleRadioChange} />
          <label className="form-check-label" htmlFor="allProducts">Tüm Ürünler</label>
        </div>
        <div className="form-check form-check-inline">
          <input className="form-check-input" type="radio" name="productType" id="soldProducts" value="sold" checked={showSoldProducts} onChange={this.handleRadioChange} />
          <label className="form-check-label" htmlFor="soldProducts">Satılmış Ürünler</label>
        </div>
        <div className="form-check form-check-inline">
          <input className="form-check-input" type="radio" name="productType" id="availableProducts" value="available" checked={showAvailableProducts} onChange={this.handleRadioChange} />
          <label className="form-check-label" htmlFor="availableProducts">Mevcut Ürünler</label>
        </div>
        <div className="form-check form-check-inline">
          <input className="form-check-input" type="radio" name="productType" id="totalProfit" value="totalProfit" checked={showTotalProfit} onChange={this.handleRadioChange} />
          <label className="form-check-label" htmlFor="totalProfit">Satılmış Ürünlerin Toplam Karı</label>
        </div>
        {showTotalProfit && (
          <div className="mt-3">
            <h5>Toplam Kar: {this.calculateTotalProfit()} TL</h5>
          </div>
        )}
        {!showTotalProfit && (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ürün Adı</th>
                <th>Fiyat</th>
                <th>Durum</th>
                <th>Satın Alan Kullanıcı İD'si</th>
                <th></th> {/* Sil butonu için boş bir th ekleyin */}
              </tr>
            </thead>
            <tbody>
              {currentProducts.map(product => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.price} TL</td>
                  <td style={{ color: product.isSale === "true" ? "red" : "green" }}>
                    {product.isSale === "true" ? "Satılmış" : "Mevcut"}
                  </td>
                  <td>{product.buyingUserID}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => this.handleDeleteProduct(product.id)}>Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Ürünler için sayfalama */}
        {!showTotalProfit && (
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
        )}
      </div>
    );
  }
}
