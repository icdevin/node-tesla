'use strict';

const rp = require('request-promise');

const config = require('../config');

class Vehicle {
  constructor (token, email, vehicle) {
    this.token = token;
    this.email = email;
    this.id = vehicle.id_s;
    this.name = vehicle.display_name;
    this.vehicle = vehicle;
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
      return this.dataRequest('vehicle_state')
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
