const request = require('request');

const crypto = require('crypto');

const BASE_URL_GATEWAY_TEST = 'https://stage-secure-gateway.hipay-tpp.com/rest/v1';
const BASE_URL_GATEWAY_PROD = 'https://secure-gateway.hipay-tpp.com/rest/v1/'

const BASE_URL_TOKENIZATION_TEST = 'https://stage-secure-vault.hipay-tpp.com/rest/v1';
const BASE_URL_TOKENIZATION_PROD = 'https://secure-vaalt.hipay-tpp.com/rest/v1/'

class HiPay {
  constructor() {
    this.isInitialized = false;
  }

  init(credentials = {}) {
    if (!credentials.username || !credentials.password) throw new Error('username and password are required');

    this.auth = {
      user: credentials.username,
      pass: credentials.password
    };

    this.passphrase = credentials.passphrase;

    this.baseUrlGateway = credentials.mod === 'production' ? BASE_URL_GATEWAY_PROD : BASE_URL_GATEWAY_TEST;
    this.baseUrlTokenization = credentials.mod === 'production' ? BASE_URL_TOKENIZATION_PROD : BASE_URL_TOKENIZATION_TEST;

    this.isInitialized = true;
  }

  order(order = {}) {
    if (!this.isInitialized) throw new Error('Serice not initialized');

    return new Promise( (resolve, reject) => {
      const options = {
        method: 'POST',
        url: `${this.baseUrlGateway}/order`,
        json: order,
        auth: this.auth
      };

      request(options, (err, response, body) => {
        if (err || response.statusCode >= 400) return reject(err || body);

        resolve(body);
      });
    });
  }

  capture(transaction = {}) {
    if (!this.isInitialized) throw new Error('Serice not initialized');

    return new Promise( (resolve, reject) => {
      const options = {
        method: 'POST',
        url: `${this.baseUrlGateway}/maintenance/transaction/${transaction.id}`,
        json: {
          operation: 'capture',
          amount: transaction.amount
        },
        auth: this.auth
      };

      request(options, (err, response, body) => {
        if (err || response.statusCode >= 400) return reject(err || body);

        resolve(body);
      });
    });
  }

  refund(transaction = {}) {
    if (!this.isInitialized) throw new Error('Serice not initialized');

    return new Promise( (resolve, reject) => {
      const options = {
        method: 'POST',
        url: `${this.baseUrlGateway}/maintenance/transaction/${transaction.id}`,
        json: {
          operation: 'refund',
          amount: transaction.amount
        },
        auth: this.auth
      };

      request(options, (err, response, body) => {
        if (err || response.statusCode >= 400) return reject(err || body);

        resolve(body);
      });
    });
  }

  cancel(transaction = {}) {
    if (!this.isInitialized) throw new Error('Serice not initialized');

    return new Promise( (resolve, reject) => {
      const options = {
        method: 'POST',
        url: `${this.baseUrlGateway}/maintenance/transaction/${transaction.id}`,
        json: {
          operation: 'cancel',
          amount: transaction.amount
        },
        auth: this.auth
      };

      request(options, (err, response, body) => {
        if (err || response.statusCode >= 400) return reject(err || body);

        resolve(body);
      });
    });
  }

  getFormUrl(order = {}) {
    if (!this.isInitialized) throw new Error('Serice not initialized');

    return new Promise( (resolve, reject) => {
      const options = {
        method: 'POST',
        url: `${this.baseUrlGateway}/hpayment`,
        json: order,
        auth: this.auth
      };

      request(options, (err, response, body) => {
        if (err || response.statusCode >= 400 || !body.forwardUrl) return reject(err || body);

        resolve(body.forwardUrl);
      });
    });
  }

  getTransactionDetails(source = {}) {
    if (!this.isInitialized) throw new Error('Serice not initialized');

    return new Promise( (resolve, reject) => {
      const options = {
        method: 'GET',
        url: `${this.baseUrlGateway}/transaction`,
        auth: this.auth
      };

      if (source.transactionId) options.url += `/${source.transactionId}`;
      else options.qs = { orderid: source.orderId };

      request(options, (err, response, body) => {
        if (err || response.statusCode >= 400) return reject(err || body);

        resolve(body);
      });
    });
  }

  getTokenDetails(data) {
    if (!this.isInitialized) throw new Error('Serice not initialized');

    return new Promise( (resolve, reject) => {
      const options = {
        method: 'GET',
        url: `${this.baseUrlTokenization}/token/${data.token}`,
        form: data,
        headers: {
          Accept: 'application/json'
        },
        auth: this.auth,
        qs: { request_id: data.requestId }
      };

      request(options, (err, response, body) => {
        if (err || response.statusCode >= 400) return reject(err || body);

        resolve(body);
      });
    });
  }

  createToken(card) {
    if (!this.isInitialized) throw new Error('Serice not initialized');

    return new Promise( (resolve, reject) => {
      const options = {
        method: 'POST',
        url: `${this.baseUrlTokenization}/token/create`,
        form: card,
        headers: {
          Accept: 'application/json'
        },
        auth: this.auth
      };

      request(options, (err, response, body) => {
        if (err || response.statusCode >= 400) return reject(err || body);

        resolve(body);
      });
    });
  }

  updateToken(data) {
    if (!this.isInitialized) throw new Error('Serice not initialized');

    return new Promise( (resolve, reject) => {
      const options = {
        method: 'POST',
        url: `${this.baseUrlTokenization}/token/update`,
        form: data,
        headers: {
          Accept: 'application/json'
        },
        auth: this.auth
      };

      request(options, (err, response, body) => {
        if (err || response.statusCode >= 400) return reject(err || body);

        resolve(body);
      });
    });
  }

  isCallbackSignatureValid(query = {}) {
    if (!this.isInitialized) throw new Error('Serice not initialized');

    const receivedHash = query.hash;

    const generatedHash = Object.keys(query)
      .sort()
      .filter( key => key !== 'hash')
      .reduce( (memo, key) => {
        if (query[key].length > 0) memo += `${key}${query[key]}${this.passphrase}`;

        return memo;
      }, '');

    return crypto.createHash('sha1').update(generatedHash).digest('hex') === receivedHash;
  }

  isNotifySignatureValid(rawBody = '', receivedHash) {
    if (!this.isInitialized) throw new Error('Serice not initialized');

    const generatedHash = `${rawBody}${this.passphrase}`;

    return crypto.createHash('sha1').update(generatedHash).digest('hex') === receivedHash;
  }
};

module.exports = new HiPay();
