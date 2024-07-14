import React, { Component } from 'react';
import axios from 'axios';
import '../styles/basket.css';

export default class Basket extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cartItems: props.cartItems || [],
      paymentInfo: {
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvc: ''
      },
      isPaymentValid: false,
      userId: ''
    };
  }

  componentDidMount() {
    const token = localStorage.getItem('token');
    if (token) {
      const userId = this.decodeToken(token);
      this.setState({ userId });
    }
  }

  decodeToken(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload)[
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
    ];
  }

  removeFromBasket = (index) => {
    const updatedCart = [...this.state.cartItems];
    updatedCart.splice(index, 1);
    this.setState({ cartItems: updatedCart });
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  }
  

  checkout = () => {
    if (this.state.isPaymentValid) {
      const { cartItems, userId } = this.state;

      const updatedCartItems = cartItems.map(item => ({
        ...item,
        isSale: "true",
        buyingUserID: userId
      }));
      console.log(userId);
      axios.post('https://localhost:7214/api/Products/updateProduct', updatedCartItems)
        .then(response => {
          console.log('Ürünler güncellendi:', response.data);
          // Sepeti temizle
          this.setState({ cartItems: [] });
          localStorage.removeItem('cartItems');
        })
        .catch(error => {
          console.error('Hata:', error);
        });
    } else {
      alert('Lütfen geçerli bir ödeme bilgisi girin.');
    }
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      paymentInfo: {
        ...prevState.paymentInfo,
        [name]: value
      }
    }), this.validatePayment);
  }

  validatePayment = () => {
    const { cardNumber, cardName, expiryDate, cvc } = this.state.paymentInfo;
    const isCardNumberValid = /^[0-9]{16}$/.test(cardNumber);
    const isCardNameValid = /^[a-zA-Z ]+$/.test(cardName);
    const isExpiryDateValid = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiryDate);
    const isCvcValid = /^[0-9]{3,4}$/.test(cvc);
    const isPaymentValid = isCardNumberValid && isCardNameValid && isExpiryDateValid && isCvcValid;
    this.setState({ isPaymentValid });
  }

  render() {
    const { cartItems, paymentInfo, isPaymentValid } = this.state;
    const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);

    return (
      <div className="basket-container">
        <h3>Sepetiniz</h3>
        {cartItems.length === 0 ? (
          <p>Sepetiniz boş.</p>
        ) : (
          <div>
            <ul>
              {cartItems.map((item, index) => (
                <li key={index}>
                  {item.name} - {item.price} &#8378;
                  <button className="btn btn-danger btn-sm" onClick={() => this.removeFromBasket(index)}>Sepetten Çıkar</button>
                </li>
              ))}
            </ul>
            <p>Toplam Fiyat: {totalPrice} &#8378;</p>
            <div className="payment-info-container">
              <div className="payment-info-box">
                <input type="text" name="cardNumber" placeholder="Kart Numarası" value={paymentInfo.cardNumber} onChange={this.handleInputChange} />
                <input type="text" name="cardName" placeholder="Kart Üzerindeki İsim" value={paymentInfo.cardName} onChange={this.handleInputChange} />
                <div className="expiry-cvc">
                  <input type="text" name="expiryDate" placeholder="MM/YY" value={paymentInfo.expiryDate} onChange={this.handleInputChange} />
                  <input type="text" name="cvc" placeholder="CVC" value={paymentInfo.cvc} onChange={this.handleInputChange} />
                </div>
              </div>
            </div>
            <button onClick={this.checkout} className="btn btn-primary" disabled={!isPaymentValid}>Satın Al</button>
          </div>
        )}
      </div>
    );
  }
}
