'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const bodyParser = require('body-parser');
const envvar = require('envvar');
const exphbs = require('express-handlebars');
const express = require('express');
const session = require('cookie-session');
const smartcar = require('smartcar');
const opn = require('opn');
const url = require('url');
const validator = require('validator');
const cookieParser = require('cookie-parser');

// Set Smartcar configuration
const PORT = process.env.PORT || 8000;
const SMARTCAR_CLIENT_ID = "359139c9-a9e5-4b4f-9d75-ab3f1a984f73";
const SMARTCAR_SECRET = "eb5df110-57b7-4da3-a8af-f319a9541603";

// Validate Client ID and Secret are UUIDs
if (!validator.isUUID(SMARTCAR_CLIENT_ID)) {
  throw new Error('CLIENT_ID is invalid. Please check to make sure you have replaced CLIENT_ID with the Client ID obtained from the Smartcar developer dashboard.');
}

if (!validator.isUUID(SMARTCAR_SECRET)) {
  throw new Error('SMARTCAR_SECRET is invalid. Please check to make sure you have replaced SMARTCAR_SECRET with your Client Secret obtained from the Smartcar developer dashboard.');
}

// Redirect uri must be added to the application's allowed redirect uris
// in the Smartcar developer portal
const SMARTCAR_REDIRECT_URI = envvar.string('SMARTCAR_REDIRECT_URI', `https://ifleet.herokuapp.com/callback`);

// Initialize Smartcar client
const client = new smartcar.AuthClient({
  clientId: SMARTCAR_CLIENT_ID,
  clientSecret: SMARTCAR_SECRET,
  redirectUri: SMARTCAR_REDIRECT_URI,
  testMode: true,
});

/**
 * Configure express server with handlebars as the view engine.
 */
const app = express();
app.use(session({
  name: 'demo-session',
  secret: 'super-duper-secret',
}));
app.use(cookieParser());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
}));
app.set('view engine', '.hbs');

/**
 * Render home page with a "Connect your car" button.
 */
app.get('/', function(req, res, next) {

  const authUrl = client.getAuthUrl();

  /**
   * Replace mode=live with mode=test so that we can render a button for test
   * mode. Normally this is done via the constructor but we need to render a URL
   * for both modes for this demo.
   */
  const testModeAuthUrl = authUrl.replace('mode=live', 'mode=test');

  res.render('home', {
    authUrls: {
      liveMode: authUrl,
      testMode: testModeAuthUrl,
    },
  });

});

/**
 * Helper function that redirects to the /error route with a specified
 * error message and action.
 */
const redirectToError = (res, message, action) => res.redirect(url.format({
  pathname: '/error',
  query: {message, action},
}));

/**
 * Render error page. Displays the action that was attempted and the error
 * message associated with that action (extracted from query params).
 */
app.get('/error', function(req, res, next) {

  const {action, message} = req.query;
  if (!action && !message) {
    return res.redirect('/');
  }

  res.render('error', {action, message});

});

/**
 * Disconnect each vehicle to cleanly logout.
 */
app.get('/logout', function(req, res, next) {
  const {access, vehicles} = req.session;
  return Promise.map(_.keys(vehicles), (id) => {
    const instance = new smartcar.Vehicle(id, access.accessToken);
    return instance.disconnect();
  })
    .finally(() => {
      req.session = null;
      res.redirect('/');
    });

  });

/**
 * Called on return from the Smartcar authorization flow. This route extracts
 * the authorization code from the url and exchanges the code with Smartcar
 * for an access token that can be used to make requests to the vehicle.
 */
app.get('/callback', function(req, res, next) {
  const code = _.get(req, 'query.code');
  if (!code) {
    return res.redirect('/');
  }

  // Exchange authorization code for access token
  client.exchangeCode(code)
    .then(function(access) {
      req.session = {};
      req.session.vehicles = {};
      req.session.access = access;
      res.cookie('access', access);
      return res.redirect('/vehicles');
    })
    .catch(function(err) {
      const message = err.message || `Failed to exchange authorization code for access token`;
      const action = 'exchanging authorization code for access token';
      return redirectToError(res, message, action);
    });

});

/**
 * Renders a list of vehicles. Lets the user select a vehicle and type of
 * request, then sends a POST request to the /request route.
 */
app.get('/vehicles', function(req, res, next) {
  const {access, vehicles} = req.session;
  if (!access) {
    return res.redirect('/');
  }
  const {accessToken} = access;
  smartcar.getVehicleIds(accessToken)
    .then(function(data) {
      const vehicleIds = data.vehicles;
      const vehicleInfoPromises = vehicleIds.map(vehicleId => {
        const vehicle = new smartcar.Vehicle(vehicleId, accessToken);
        return vehicle.info();
      });

      const vehicleLocationPromises = vehicleIds.map(vehicleId => {
        const vehicle = new smartcar.Vehicle(vehicleId, accessToken);
        return vehicle.location();
      });

      return Promise.all(vehicleInfoPromises.concat(vehicleLocationPromises))
        .then(function(data) {
          let ans = [];
          let mid = data.length/2;
          for(var i = 0; i < mid; i++){
            let merged = {...data[i], ...data[mid+i]};
            ans.push(merged);
          }

          res.send(ans);
        })
        .catch(function(err) {
          const message = err.message || 'Failed to get vehicle info.';
          const action = 'fetching vehicle info';
          return redirectToError(res, message, action);
        });
    });

});

//lock
app.post('/lock', function(req, res, next) {
  const {access, vehicles} = req.session;
  if (!access) {
    return res.redirect('/');
  }
  const {accessToken} = access;
  smartcar.getVehicleIds(accessToken)
    .then(function(data) {
      const vehicleIds = data.vehicles;
      const vehicleLock = vehicleIds.map(vehicleId => {
        const vehicle = new smartcar.Vehicle(vehicleId, accessToken);
        return vehicle.lock();
      });

      return Promise.all(vehicleLock)
        .then(function(data) {
          res.send(data);
        })
        .catch(function(err) {
          const message = err.message || 'Failed to get vehicle info.';
          const action = 'fetching vehicle info';
          return redirectToError(res, message, action);
        });
    });

});

/**
 * Triggers a request to the vehicle and renders the response.
 */
app.post('/request', function(req, res, next) {
  //const {access, vehicles} = req.session;
  const {access, vehicles} = req.cookies;
  if (!access) {
    return res.redirect('/');
  }

  const {vehicleId, requestType: type} = req.body;
  const vehicle = vehicles[vehicleId];
  const instance = new smartcar.Vehicle(vehicleId, access.accessToken);

  let data = null;

  // .then(({data}) => res.render('data', {data, type, vehicle}))
  instance.location()
    .then(({data}) => res.send({data, type, vehicle}))
    .catch(function(err) {
      const message = err.message || 'Failed to get vehicle location.';
      const action = 'fetching vehicle location';
      return redirectToError(res, message, action);
    });
});

app.listen(PORT, function() {
  console.log(`smartcar-demo server listening on port ${PORT}`);
  opn(`http://localhost:${PORT}`);
});
