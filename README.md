# Tesla Motors Node API

A Node.js module wrapper for the [Tesla Motors](https://www.tesla.com/) JSON
API. This library allows developers to write server-side JavaScript that
interacts with various Tesla Motors API endpoints, from authentication to
individual vehicle data streams, without having to concern themselves with the
details of interacting with the API directly.

Although this library was written with the
[Model S](https://www.tesla.com/models) in mind, it will work just as well for
the [Model X](https://www.tesla.com/modelx).

## Installation

Add to your project's dependencies with
[Yarn](https://github.com/yarnpkg/yarn):

`yarn install node-tesla --save`

Or with npm:

`npm install node-tesla --save`

## Basic Usage

Start by requiring the `node-tesla` library and creating a new `Tesla`
instance, the class which is responsible for holding on to a Tesla account's
details. All that's required is the account e-mail address.

```js
const Tesla = require('node-tesla').Tesla;

const account = new Tesla('test@example.com');
```

### Authentication

However, simply creating the account doesn't perform authentication, which
will need to be done before using just about any other API functionality. To do
that, call the `authenticate` method on the account instance passing in the
account password as the sole argument.

`authenticate`, along with most methods found in this API, perform
asynchronous operations and as such return [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```js
account.authenticate('a$tr0ngPa$sw0rd').then((response) => {
  // Yay, successfully authenticated! The response likely contains only the
  // authentication ("Bearer") token
}, (error) => {
  // Error authenticating, handle it!
});
```

Behind the scenes, Tesla's API uses the [OAuth 2.0 Bearer token flow](http://self-issued.info/docs/draft-ietf-oauth-v2-bearer.html), and the
token used to authenticate is passed as the only argument to the `authenticate` method's resolve handler. However, object instances instantiated via the
`Tesla` constructor ("account" constructor) keep a reference to the latest
token (in-memory only). In case you store the token and the expiration and find
a still-valid token on instantiation, it can be passed in as the second
argument to the `Tesla` constructor and the authentication piece can be
skipped (see the [detailed documentation](#) on the `Tesla` constructor for
more possible options).

### Getting vehicles

`Vehicle` instances are where the good stuff happens. Use the `vehicles` method
on account instance to fetch metadata for all vehicles.

```js
account.vehicles().then(vehicles) => {
  // `vehicles` is an array of Vehicle instances
  // Use lodash's `find` method to get the first vehicle named `Magnum Opus`
  const magnumOpus = _.find(vehicles, { name: 'Magnum Opus' });
}, (error) => {
  // Error getting vehicles, handle it!
});
```

### Issuing data requests and commands

Once you have a `Vehicle` instance, both commands - actions such as honking the
horn - and data requests - requests that purely provide various data points
about the state of the vehicle - can be executed from the instance. Vehicles
may need to be woken up before other commands/data requests can be made. For
example, to honk the horn:

```js
magnumOpus.wakeUp((response) => {
  return magnumOpen.honkHorn();
}, (error) => {
  // Error waking up the vehicle, handle it!
}).then((response) => {
  // Horn successfully honked!
}, (error) => {
  // Error honking the horn, handle it!
});
```

See the [`Vehicle` documentation](#) for additional commands and further
information.
