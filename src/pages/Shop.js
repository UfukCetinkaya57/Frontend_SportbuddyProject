import React, { Component } from 'react';
import axios from 'axios';
import '../styles/shop.css';

export default class Shop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      productName: '',
      productDescription: '',
      productPrice: '',
      productPhotoBase64: null,
      productCategory: ''
    };
  }

  handleInputChange = (event) => {
    const { name, files } = event.target;
    if (name === 'productImage') {
      const reader = new FileReader();
      console.log(reader);
      reader.onloadend = () => {
        const base64Content = reader.result.split(';base64,')[1];
        this.setState({ productPhotoBase64: base64Content });
      };
      reader.readAsDataURL(files[0]);
    } else {
      this.setState({ [name]: event.target.value });
    }
  };
  

  handleSubmit = (event) => {
    event.preventDefault();
    const { productName, productDescription, productPrice, productPhotoBase64, productCategory } = this.state;

    const newProduct = {
      name: productName,
      description: productDescription,
      price: parseFloat(productPrice),
      photoBase64: productPhotoBase64,
      category: productCategory,
      isSale: "false"
    };

    axios.post('https://localhost:7214/api/Products/addProduct', newProduct)
      .then(response => {
        console.log(response.data);
         // Yeni ürün eklediğimizde sayfayı yenilemek için
      })
      .catch(error => {
        console.error('Error:', error);
      });

    this.setState({
      productName: '',
      productDescription: '',
      productPrice: '',
      productPhotoBase64: null,
      productCategory: ''
    });
  };

 

  handleDelete = (productId) => {
    axios.delete(`https://localhost:7214/api/Products/${productId}`)
      .then(response => {
        console.log(response.data);
        this.fetchProducts(); // Ürün silindiğinde sayfayı yenilemek için
      })
      .catch(error => {
        console.error('Error deleting product:', error);
      });
  };

  render() {
    const { productName, productDescription, productPrice, productCategory, products } = this.state;

    return (
      <div className="container">
        <h1 className='mt-4'>Ürün Yükleme Sayfası</h1>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="productName">Ürün Adı</label>
          <input type="text" id="productName" name="productName" value={productName} onChange={this.handleInputChange} required />

          <label htmlFor="productDescription">Ürün Açıklaması</label>
          <textarea id="productDescription" name="productDescription" value={productDescription} onChange={this.handleInputChange} rows="3" style={{ width: "100%", resize: "none" }} required />

          <label htmlFor="productPrice">Ürün Fiyatı (TL)</label>
          <input type="number" id="productPrice" name="productPrice" min="0" step="0.1" value={productPrice} onChange={this.handleInputChange} required />

          <label htmlFor="productImage">Ürün Resmi</label>
          <input type="file" id="productImage" name="productImage" accept="image/*" onChange={this.handleInputChange} required />

          <label htmlFor="productCategory">Ürün Kategorisi</label>
          <input type="text" id="productCategory" name="productCategory" value={productCategory} onChange={this.handleInputChange} required />

          <button type="submit">Ürünü Yükle</button>
        </form>

        <hr />

        <h2>Yüklenen Ürünler</h2>
        <ul>
          {products.map((product) => (
            <li className="product-item" key={product.id}>
              <div className="product-details">
                <img src={`data:image/jpeg;base64,${product.photoBase64}`} alt={product.name} className="product-image" />
                <strong>{product.name}</strong> - {product.description} - {product.price} TL{' '}
              </div>
              <button className="delete-button" onClick={() => this.handleDelete(product.id)}>Sil</button>
              <button className="delete-button" onClick={() => this.handleDelete(product.id)}>Satın al</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
// ekliyor ama foto gelmiyor

