import React from 'react';
import img1 from '../assets/img1.jpg';
import img2 from '../assets/img2.jpg';
import img3 from '../assets/img3.jpg';

import "../styles/anaekran.css";

function AnaEkran() {
  return (
    <div className="landing-page-container">
      <div className="landing-page-header">
        <h1 className='landing-page-heading'>Spor Arkadaşınız Burada!</h1>
        <p className="landing-page-description">Spor yapmak istediğiniz arkadaşlarınızı kolayca bulun ve birlikte spor yapmaya başlayın.</p>
        <p className="landing-page-contact">Ürünlerinizi satmak için bize ulaşın.</p>
        <p className="mb-0">
        <a href="https://www.instagram.com/altayemircan/" class="btn btn-dark btn-sm" role="button">SporArkadaşım.shop</a>

        </p>
      </div>
      <div className="image-grid">
        <div className="sport-image-container">
          <img  src={img1} alt="Basketbol" />
        </div>
        <div className="sport-image-container">
          <img  src={img2} alt="Voleybol" />
        </div>
        <div className="sport-image-container">
          <img  src={img3} alt="Futbol" />
        </div>
      </div>
      <div className="landing-page-footer">
        <p className="footer-text">Spor arkadaşı bulmak ve etkinliklere katılıp sosyalleşmek için bize katılın !</p>
      </div>
    </div>
  );
}

export default AnaEkran;
