'use strict';

const Promise = require('bluebird');
const rp = require('request-promise');

const Vehicle = require('./vehicle');
const config = require('../config');

class Tesla {
  constructor ({
    email,
    token,
    clientId = process.env.TESLA_CLIENT_ID,
    clientSecret = process.env.TESLA_CLIENT_SECRET,
    locale = 'en_US'
  } = {}) {
    this.email = email;
    this.token = token;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.locale = locale;
  }

  authenticate (password) {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        uri: 'https://owner-api.teslamotors.com/oauth/token',
        json: true,
        body: {
          grant_type: 'password',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          email: this.email,
          password: password
        }
      };

      return rp(options)
        .then(data => {
          this.token = data.access_token;
          return resolve(data);
        })
        .catch(err => reject(err));
    });
  }

  vehicles () {
    return new Promise((resolve, reject) => {
      const options = {
        uri: `${config.BASE_URL}/vehicles`,
        json: true,
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      };

      return rp(options)
        .then(response => {
          const vehicleJSON = response.response;
          const vehiclesArr = vehicleJSON.map(vehicle => {
            return new Vehicle({
              token: this.token,
              email: this.email,
              vehicle,
              locale: this.locale
            });
          });
          return resolve(vehiclesArr);
        })
        .catch(err => reject(err));
    });
  }
}

module.exports = Tesla;
