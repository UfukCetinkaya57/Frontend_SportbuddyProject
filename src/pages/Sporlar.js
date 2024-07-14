import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import KabbadiImg from '../assets/Kabbadi.jpg';
import Cycle from "../assets/CycleBall.jpg"
import Hurling from "../assets/hurlingg.jpg"
import "../styles/Sporlar.css"

export default class Sporlar extends Component {
  renderSporCard(image, title, text, link) {
    return (
      <div className="col-md-4 mb-4">
        <div className="card">
          <img src={image} className="card-img-top" alt={title} />
          <div className="card-body">
            <h5 className="card-title">{title}</h5>
            <p className="card-text">{text}</p>
            <Link to={link} target="_blank" className="btn btn-primary">Detaylı Öğren</Link>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="container py-5">
        <h2 className="text-center mb-4">Sporlar</h2>
        <div className="row">
          {this.renderSporCard(KabbadiImg, 'Kabbadi', 'Bu spor branşı her ne kadar Asya Kıtası’nde ortaya çıksa da, günümüz dünyasında önce Amerika’da sonra da Avrupa’da hızla popülerleşmeye başladı.', 'https://www.cnnturk.com/yazarlar/guncel/sercan-sipka/kabaddi-yeni-populerlesen-takim-sporu')}
          {this.renderSporCard(Cycle, 'Cycleball', 'Adından da anlaşıldığı gibi cycle ball bisikletle oynanan bir futbol türü. Ancak futboldan bir hayli farklı…  ',"https://steemit.com/tr/@jjbobby34/bisiklet-tutkunlarina-yepyeni-bir-spor-daha-cycle-ball")}
          {this.renderSporCard(Hurling, 'Hurling', 'Hurling, ırlanda kökenli bir spor dalıdır. Kürekler ve top gibi aletlerin kullanıldığı bir oyundur. Geleneksel ırlanda kültüründe önemli bir yere sahiptir.', 'https://tr.wikipedia.org/wiki/Hurling')}
        </div>
      </div>
    );
  }
}
