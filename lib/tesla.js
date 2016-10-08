'use strict';

const Promise = require('bluebird');
const rp = require('request-promise');

const Vehicle = require('./vehicle');
const config = require('../config');

class Tesla {
  constructor (email, clientId, clientSecret) {
    this.email = email;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  authenticate (password) {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        uri: `https://owner-api.teslamotors.com/oauth/token`,
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
          return resolve();
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
            return new Vehicle(this.token, this.email, vehicle);
          });
          return resolve(vehiclesArr);
        })
        .catch(err => reject(err));
    });
  }
}

module.exports = Tesla;
