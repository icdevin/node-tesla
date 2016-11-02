'use strict';

const WebSocket = require('ws');

const config = require('../config');

/**
 * Per-vehicle summon functionality. Also known as Autopark in other libraries.
 * Separated due to these methods operating on a single websocket, whereas these
 * base vehicle control methods operate via regular HTTP methods.
 */
class Summon {
  constructor (vehicle) {
    this.vehicle = vehicle;

    const authBuf = new Buffer(
      `${this.vehicle.email}:${this.vehicle.vehicle.tokens[0]}`
    );
    const encodedAuthStr = authBuf.toString('base64');
    this.socket = new WebSocket(
      `${config.SOCKET_BASE_URL}/connect/${vehicle.vehicle.vehicle_id}`,
      null,
      {
        headers: {
        'Authorization': `Basic ${encodedAuthStr}`
        }
      }
    );

    this.socket.on('message', data => {
      const message = JSON.parse(data);
      switch (message.msg_type) {
        case 'control:hello':
          this.beginHeartbeat(message.autopark.heartbeat_frequency);
          break;
        case 'autopark:status':
          this.autoParkReady = message.autopark_state === 'ready';
          break;
        case 'homelink:status':
          this.homeLinkNearby = message.homelink_hearby;
          break;
      }
    });

    return this;
  }

  beginHeartbeat (frequency) {
    this.heartbeatTimer = setInterval(() => {
      this.summonHeartbeat().catch(err => {
        this.socket.close(1, err);
      });
    }, frequency);
  }

  summonHeartbeat () {
    return new Promise((resolve, reject) => {
      const commandObj = {
        msg_type: 'autopark:heartbeat_app',
        timestamp: Date.now()
      };
      this.socket.send(JSON.stringify(commandObj), err => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  summonForward () {
    return new Promise((resolve, reject) => {
      const pos = this.vehicle.driveState().then(state => {
        const commandObj = {
          msg_type: 'autopark:cmd_forward',
          latitude: state.latitude,
          longitude: state.longitude
        };
        this.socket.send(JSON.stringify(commandObj), err => {
          if (err) return reject(err);
          return resolve();
        });
      }).catch(err => reject(err));
    });
  }

  summonReverse () {
    return new Promise((resolve, reject) => {
      const pos = this.vehicle.driveState().then(state => {
        const commandObj = {
          msg_type: 'autopark:cmd_reverse',
          latitude: state.latitude,
          longitude: state.longitude
        };
        this.socket.send(JSON.stringify(commandObj), err => {
          if (err) return reject(err);
          return resolve();
        });
      }).catch(err => reject(err));
    });
  }

  summonAbort () {
    return new Promise((resolve, reject) => {
      const commandObj = {
        msg_type: 'autopark:cmd_abort'
      };
      this.socket.send(JSON.stringify(commandObj), err => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  homeLinkTrigger () {
    return new Promise((resolve, reject) => {
      const pos = this.vehicle.driveState().then(state => {
        const commandObj = {
          msg_type: 'homelink:cmd_trigger',
          latitude: state.latitude,
          longitude: state.longitude
        };
        this.socket.send(JSON.stringify(commandObj), err => {
          if (err) return reject(err);
          return resolve();
        });
      }).catch(err => reject(err));
    });
  }
}

module.exports = Summon;
