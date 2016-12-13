'use strict';

const https = require('https');
const Readable = require('stream').Readable;

const _ = require('lodash');
const rp = require('request-promise');

const config = require('../config');

// These will be assigned when the locale is set
let compositorConfig;
let allOptions;

class Vehicle {
  constructor ({ token, email, vehicle, locale = 'en_US' } = {}) {
    this.token = token;
    this.email = email;
    this.id = vehicle.id_s;
    this.name = vehicle.display_name;
    this.vehicle = vehicle;
    this.locale = locale;
  }

  set locale (locale) {
    compositorConfig = require(`../data/models/${locale}.json`);
    allOptions = compositorConfig.configSetPrices.options;
    this.vehicle.options = this.getOptions();
    return locale;
  }

  getOptions () {
    const optionCodes = this.vehicle.option_codes.split(',');

    // Map over the option codes and return the readable name of the
    // corresponding object
    return _.compact(optionCodes.map(optionCode => {
      if (allOptions[optionCode]) {
        // If it's a root-level option and the name is meaningful (i.e. not the
        // same as the option code), return it
        const thisOption = allOptions[optionCode];
        if (thisOption.name && thisOption.name !== optionCode) {
          return thisOption.name;
        }
      } else {
        // If it's not a root-level option, it could be a value to a root-level
        // option, so check there
        // TODO: Refactor, this is garbage
        let foundOption = undefined;
        _.forOwn(allOptions, (optionObj, code) => {
          if (optionObj.value_list[optionCode]) foundOption = optionObj;
        });
        if (foundOption) return foundOption.name;
      }

      // If it got here, no option was found and the return will be compacted
      return undefined;
    }));
  }

  stream () {
    return new Promise((resolve, reject) => {
      // These are the values being requested from each chunk of data
      // Some may be empty (e.g. if the car is not moving, speed is empty)
      const params = [
        'speed', 'odometer', 'soc', 'elevation', 'est_heading', 'est_lat',
        'est_lng', 'power', 'shift_state', 'range', 'est_range', 'heading'
      ];
      // NOTE: Uses the vehicle.tokens[0], NOT the OAuth token
      const authBuf = new Buffer(`${this.email}:${this.vehicle.tokens[0]}`);
      const encodedAuthStr = authBuf.toString('base64');
      const options = {
        hostname: 'streaming.vn.teslamotors.com',
        path: `/stream/${this.vehicle.vehicle_id}/?values=${params.join(',')}`,
        headers: {
          'Authorization': `Basic ${encodedAuthStr}`
        }
      };

      const req = https.request(options, res => {
        // Create a readable stream to push transformed data chunks through
        const rs = new Readable({
          read () {
            return this.data;
          }
        });
        // Set the encoding for stream consumers ahead of time
        rs.setEncoding('utf8');

        // Set the encoding for Tesla's response
        res.setEncoding('utf8');

        // Handle the response stream events
        res.on('data', function onData (chunk) {
          const data = chunk.split(',');
          const dataObj = _.zipObject(params, _.tail(data, 2));
          dataObj.time = new Date(+data[0]);

          // Set data on the stream
          rs.data = JSON.stringify(dataObj);
          rs.push(JSON.stringify(dataObj));
        });
        res.on('end', () => rs.emit('end'));

        // Set the full response as the incoming message
        // NOTE: `res` is an instance of http.IncomingMessage
        rs.incomingMessage = res;

        // Return our new stream
        return resolve(rs);
      });

      // Reject on connection errors
      req.on('error', reject);

      return req.end();
    });
  }

  update () {
    return new Promise((resolve, reject) => {
      const options = {
        uri: `${config.BASE_URL}/vehicles/${this.id}`,
        json: true,
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      };

      return rp(options)
        .then(response => {
          const vehicle = response.response;
          this.vehicle = vehicle.vehicle;
          return resolve(vehicle);
        })
        .catch(err => reject(err));
    });
  }

  dataRequest (name) {
    return new Promise((resolve, reject) => {
      const options = {
        uri: `${config.BASE_URL}/vehicles/${this.id}/data_request/${name}`,
        json: true,
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      };

      return rp(options)
        .then(response => resolve(response.response))
        .catch(err => reject(err));
    });
  }

  command (name, body = null) {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        uri: `${config.BASE_URL}/vehicles/${this.id}/command/${name}`,
        json: true,
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body
      };

      return rp(options)
        .then(response => resolve(response.response))
        .catch(err => reject(err));
    });
  }

  mobileEnabled () {
    return new Promise((resolve, reject) => {
      const options = {
        uri: `${config.BASE_URL}/vehicles/${this.id}/mobile_enabled`,
        json: true,
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      };

      return rp(options)
        .then(response => {
          return resolve(response.response);
        })
        .catch(err => reject(err));
    });
  }

  guiSettings () {
    return new Promise((resolve, reject) => {
      return this.dataRequest('gui_settings')
        .then(response => {
          return resolve(response);
        })
        .catch(err => reject(err));
    });
  }

  chargeState () {
    return new Promise((resolve, reject) => {
      return this.dataRequest('charge_state')
        .then(response => {
          return resolve(response);
        })
        .catch(err => reject(err));
    });
  }

  climateState () {
    return new Promise((resolve, reject) => {
      return this.dataRequest('climate_state')
        .then(response => {
          return resolve(response);
        })
        .catch(err => reject(err));
    });
  }

  driveState () {
    return new Promise((resolve, reject) => {
      return this.dataRequest('drive_state')
        .then(response => {
          return resolve(response);
        })
        .catch(err => reject(err));
    });
  }

  vehicleState () {
    return new Promise((resolve, reject) => {
      return this.dataRequest('vehicle_state')
        .then(response => {
          return resolve(response);
        })
        .catch(err => reject(err));
    });
  }

  wakeUp () {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        uri: `${config.BASE_URL}/vehicles/${this.id}/wake_up`,
        json: true,
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      };

      return rp(options)
        .then(response => {
          return resolve(response.response);
        })
        .catch(err => reject(err));
    });
  }

  setValetMode (on, password = null) {
    return new Promise((resolve, reject) => {
      return this.command('set_valet_mode', { on, password })
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  resetValetPin () {
    return new Promise((resolve, reject) => {
      return this.command('reset_valet_pin')
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  chargePortDoorOpen () {
    return new Promise((resolve, reject) => {
      return this.command('charge_port_door_open')
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  chargeStandard () {
    return new Promise((resolve, reject) => {
      return this.command('charge_standard')
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  chargeMaxRange () {
    return new Promise((resolve, reject) => {
      return this.command('charge_max_range')
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  setChargeLimit (percent) {
    return new Promise((resolve, reject) => {
      return this.command('set_charge_limit', { percent })
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  chargeStart () {
    return new Promise((resolve, reject) => {
      return this.command('charge_start')
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  chargeStop () {
    return new Promise((resolve, reject) => {
      return this.command('charge_stop')
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  flashLights () {
    return new Promise((resolve, reject) => {
      return this.command('flash_lights')
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  honkHorn () {
    return new Promise((resolve, reject) => {
      return this.command('honk_horn')
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  doorUnlock () {
    return new Promise((resolve, reject) => {
      return this.command('door_unlock')
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  doorLock () {
    return new Promise((resolve, reject) => {
      return this.command('door_lock')
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  setTemps (driverTemp, passengerTemp) {
    return new Promise((resolve, reject) => {
      return this.command('set_temps', { driverTemp, passengerTemp })
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  autoConditioningStart () {
    return new Promise((resolve, reject) => {
      return this.command('auto_conditioning_start')
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  autoConditioningStop () {
    return new Promise((resolve, reject) => {
      return this.command('auto_conditioning_stop')
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  sunRoofControl (state) {
    return new Promise((resolve, reject) => {
      return this.command('sun_roof_control', { state })
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  sunRoofMove (percent) {
    return new Promise((resolve, reject) => {
      return this.command('sun_roof_move', { percent })
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  remoteStartDrive (password) {
    return new Promise((resolve, reject) => {
      return this.command('remote_start_drive', { password })
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  openTrunk () {
    return new Promise((resolve, reject) => {
      return this.command('open_trunk', { which_trunk: 'rear' })
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }

  openFrunk () {
    return new Promise((resolve, reject) => {
      return this.command('open_trunk', { which_trunk: 'front' })
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }
}

module.exports = Vehicle;
