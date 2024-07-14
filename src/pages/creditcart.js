import React, { Component } from 'react';
import axios from 'axios';
import '../styles/kredi.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCcVisa, faCcMastercard } from '@fortawesome/free-brands-svg-icons';

export default class CreditCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cardNumber: '',
      cardHolderName: '',
      expirationMonth: '',
      expirationYear: '',
      cvc: '',
      errors: {
        cardNumber: '',
        cardHolderName: '',
        expirationMonth: '',
        expirationYear: '',
        cvc: ''
      }
    };
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
    this.validateInput(name, value);
  };

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.formIsValid()) {
      const { cardNumber, cardHolderName, expirationMonth, expirationYear, cvc } = this.state;
      const { location } = this.props;
      const cartTotalPrice = location?.state?.cartTotalPrice || 0;

      axios.post('https://api.example.com/checkout', {
        cardNumber,
        cardHolderName,
        expirationMonth,
        expirationYear,
        cvc,
        totalPrice: cartTotalPrice
      })
        .then(response => {
          console.log('Satın alma başarılı:', response.data);
          // Başarılı bir satın alma durumunda, başka bir sayfaya yönlendirme veya uygun bir mesaj gösterme gibi işlemler yapabilirsiniz
        })
        .catch(error => {
          console.error('Satın alma sırasında bir hata oluştu:', error);
          // Hata durumunda kullanıcıya bir hata mesajı gösterebilirsiniz
        });
    } else {
      console.log('Form geçerli değil.');
      // Eğer form geçerli değilse, kullanıcıya uygun bir hata mesajı gösterebilirsiniz
    }
  };

  validateInput = (name, value) => {
    const { errors } = this.state;
    switch (name) {
      case 'cardNumber':
        errors.cardNumber = value.length === 16 ? '' : 'Kart numarası 16 haneli olmalıdır';
        break;
      case 'cardHolderName':
        errors.cardHolderName = value.trim() !== '' ? '' : 'Kart sahibinin adı soyadı girilmelidir';
        break;
      case 'expirationMonth':
        errors.expirationMonth = value !== '' ? '' : 'Son kullanma ayını giriniz';
        break;
      case 'expirationYear':
        errors.expirationYear = value !== '' ? '' : 'Son kullanma yılını giriniz';
        break;
      case 'cvc':
        errors.cvc = value.length === 3 ? '' : 'CVV 3 haneli olmalıdır';
        break;
      default:
        break;
    }
    this.setState({ errors });
  };

  formIsValid = () => {
    const { errors } = this.state;
    return Object.values(errors).every(error => error === '');
  };

  render() {
    const { cardNumber, cardHolderName, expirationMonth, expirationYear, cvc, errors } = this.state;
    const { location } = this.props;
    const cartTotalPrice = location?.state?.cartTotalPrice || 0;

    return (
      <div className="credit-card-container">
        <h2>Kart Numarası</h2>
        <div className="card-icons">
          <FontAwesomeIcon icon={faCcVisa} />
          <FontAwesomeIcon icon={faCcMastercard} />
        </div>
        <div className="card-number-input">
          <input type="text" name="cardNumber" placeholder="1234 1234 1234 1234" value={cardNumber} onChange={this.handleChange} />
          {errors.cardNumber && <span className="input-error">{errors.cardNumber}</span>}
        </div>

        <h2>Kart Üzerindeki İsim</h2>
        <div className="card-holder-input">
          <input type="text" name="cardHolderName" placeholder="Kart Sahibinin Adı Soyadı" value={cardHolderName} onChange={this.handleChange} />
          {errors.cardHolderName && <span className="input-error">{errors.cardHolderName}</span>}
        </div>

        <h2>Son Kullanma Tarihi</h2>
        <div className="expiration-input">
          <select name="expirationMonth" value={expirationMonth} onChange={this.handleChange}>
            <option value="">Ay</option>
            {[...Array(12).keys()].map(month => (
              <option key={month + 1} value={month < 9 ? `0${month + 1}` : `${month + 1}`}>{month < 9 ? `0${month + 1}` : `${month + 1}`}</option>
            ))}
          </select>
          <select name="expirationYear" value={expirationYear} onChange={this.handleChange}>
            <option value="">Yıl</option>
            {[...Array(10).keys()].map(year => (
              <option key={year + 2022} value={year + 2022}>{year + 2022}</option>
            ))}
          </select>
          {errors.expirationMonth && <span className="input-error">{errors.expirationMonth}</span>}
          {errors.expirationYear && <span className="input-error">{errors.expirationYear}</span>}
        </div>

        <h2>CVC</h2>
        <div className="cvc-input">
          <input type="text" name="cvc" placeholder="CVV" value={cvc} onChange={this.handleChange} />
          {errors.cvc && <span className="input-error">{errors.cvc}</span>}
        </div>

        <h2>Sepet Toplamı: {cartTotalPrice} &#8378;</h2>
        
        <button onClick={this.handleSubmit}>Satın Al</button>
      </div>
    );
  }
}
