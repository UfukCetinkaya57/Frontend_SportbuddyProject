import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import '../styles/magaza.css';

export default class Mağaza extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      currentPage: 1,
      productsPerPage: 8,
      currentUser: getCurrentUser(),
      minPrice: '',
      maxPrice: '',
      searchName: '', // Arama için ürün ismi
      isFilterOpen: false, // Filtreleme alanlarının açık/kapalı durumu
    };
  }

  componentDidMount() {
    this.fetchProducts();
  }

  fetchProducts = () => {
    axios.get('https://localhost:7214/api/Products/getAllProduct')
      .then(response => {
        const productsWithImages = response.data.map(product => {
          const base64Image = `data:image/jpeg;base64,${product.photoBase64}`;
          return { ...product, base64Image };
        });
        const filteredProducts = productsWithImages.filter(product => product.isSale !== "true");
        this.setState({ products: filteredProducts });
      })
      .catch(error => {
        console.error('Hata:', error);
      });
  }

  addToCart = (product) => {
    this.props.addToCart(product);
    alert("Sepete Eklendi")
  }

  paginate = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  }

  filterProducts = () => {
    const { minPrice, maxPrice, searchName } = this.state;
    let filteredProducts = this.state.products;

    if (minPrice !== '') {
      filteredProducts = filteredProducts.filter(product => product.price >= minPrice);
    }

    if (maxPrice !== '') {
      filteredProducts = filteredProducts.filter(product => product.price <= maxPrice);
    }

    if (searchName !== '') {
      filteredProducts = filteredProducts.filter(product => product.name.toLowerCase().includes(searchName.toLowerCase()));
    }

    return filteredProducts;
  }

  handleMinPriceChange = (event) => {
    this.setState({ minPrice: event.target.value });
  }

  handleMaxPriceChange = (event) => {
    this.setState({ maxPrice: event.target.value });
  }

  handleSearchNameChange = (event) => {
    this.setState({ searchName: event.target.value });
  }

  toggleFilter = () => {
    this.setState(prevState => ({ isFilterOpen: !prevState.isFilterOpen }));
  }

  applyFilter = () => {
    this.setState({ isFilterOpen: false }); // Filtreleme uygulandıktan sonra filtreleme alanını kapat
    this.fetchProducts();
  }

  render() {
    const { currentPage, productsPerPage, currentUser, minPrice, maxPrice, searchName, isFilterOpen } = this.state;
    const filteredProducts = this.filterProducts();

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredProducts.length / productsPerPage); i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="container">
        <h3 className='mt-4'>----</h3>
        <Link to="/basket" className='btn btn-success btn-sm'>Sepete Git</Link>
        <div className="filter-header mb-3 mt-3" onClick={this.toggleFilter}>
          <FontAwesomeIcon icon={faFilter} beat />
          <span className="filter-text ">       Ürünleri Filtrele</span>
        </div>

        {/* Filtreleme Alanları */}
        {isFilterOpen && (
          <div className="price-filter">
            <div className="price-inputs mb-3">
              <label>Min Fiyat:</label>
              <input type="number" value={minPrice} onChange={this.handleMinPriceChange} />
            </div>
            <div className="price-inputs mb-3">
              <label>Max Fiyat:</label>
              <input type="number" value={maxPrice} onChange={this.handleMaxPriceChange} />
            </div>
            <div className="search-inputs">
              <label>Ürün İsmi:</label>
              <input type="text" value={searchName} onChange={this.handleSearchNameChange} />
            </div>
            <button className='mt-3 mb-3 btn btn-outline-primary btn-sm' onClick={this.applyFilter}>Filtrele</button>
          </div>
        )}

        <div className="product-grid">
          {currentProducts.map((product) => (
            <div key={product.id} className="product-card bg-light bg-gradient">
              <img src={product.base64Image} alt={product.name} className="product-image" />
              <div className="product-details">
                <h2>{product.name}</h2>
                <p>{product.description}</p>
                <p>Fiyat: {product.price} &#8378;</p>
                {currentUser === product.addedBy ? (
                  <p className="added-by">Bu ürünü siz eklediniz</p>
                ) : (
                  <button onClick={() => this.addToCart(product)} className="buy-button">Sepete ekle</button>
                )}
              </div>
            </div>
          ))}
        </div>

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

function getCurrentUser() {
  return 'kullanıcı_adı';
}
