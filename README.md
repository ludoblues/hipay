# HiPay SDK
Library that enables you to interact with the Gateway and the Tokenization HiPay APIs.

*Notes:*
- This package respects the [semver](http://semver.org/) and the [keep a changelog](http://keepachangelog.com/) specifications.
- Every asynchronous methods can be used with async/await ES7 features, generators, or promises.
- Every methods listed but not specified here fit the HiPay specifications, so please refer to their documentation to know exactly how to provide them.

## Install
npm i hipay

## Available Methods

#### Hipay#init(credentials)
````js
const credentials = {
  username: String, // (required)
  password: String, // (required)
  passphrase: String,
  mod: String // production || test (default: test)
};
````
#### Hipay#order(order)

#### Hipay#capture(transaction)

#### Hipay#refund(transaction)

#### Hipay#cancel(transaction)

#### Hipay#getFormUrl(order)

#### Hipay#getTransactionDetails(source)
````js
const source = {
  transactionId: String
};
````

Or

````js
const source = {
  orderId: String
};
````

#### Hipay#getTokenDetails(data)

#### Hipay#createToken(card)

#### Hipay#updateToken(data)

#### Hipay#isCallbackSignatureValid(query)

#### Hipay#isNotifySignatureValid(rawBody, receivedHash)

## Example

```` js
const bodyParser = require('body-parser');
const hipay = require('hipay');
const server = require('express')();

hipay.init({
  username: 'john',
  password: 'shhhh',
  passphrase: 'secret',
  mod: 'test'
});

server.use(bodyParser.json());

server.post('/order', async (req, res) => {
  try {
    const hipayResponse = await hipay.order(req.body);

    res.send(hipayResponse);
  } catch(e) {
    res.status(500).send(e);
  }
});

server.listen(3000);
````
