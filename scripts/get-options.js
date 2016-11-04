// Gets all valid internationl Design Studio URLs via <link> meta tags and
// grabs the primary `tesla` object on each page, containing data needed to run
// the Design Studio/compositor, and dumps it into a JSON file in ../data/
// using the language key as the file name
//
// USE: Requires PhantomJS; Install with npm/yarn install -g phantom phantomjs
// Run with from the parent directory w/ `phantomjs scripts/get-options.js`
//
// Disclaimer: I have no idea what I'm doing. Also, this may need to be run
// more than once due to async timing differences when loading pages

// This is not the `fs` you are looking for...
var fs = require('fs');
var webpage = require('webpage');

var _ = require('lodash');
// PhantomJS doesn't support native Promise
var Promise = require('bluebird');

function getI18nLinks (model, idx) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log('Getting i18n links for ' + model);
      var page = webpage.create();
      page.open('https://www.tesla.com/' + model + '/design', function (status) {
        if (status === 'success') {
          return resolve({
            model: model,
            links: page.evaluate(function () {
              var links = [];
              // Get all of the <link> tags with alternate language hrefs and push
              // their href to a list
              $('[hreflang]').each(function (i, el) {
                // Grab the href and force HTTPS
                var href = el.href.replace('http://', 'https://');
                links.push(href);
              });
              return links;
            })
          });
        } else {
          return resolve({ model: model, links: [] });
        }
      });
    // There's some loading issue when requesting simultaneously
    }, !idx ? 0 : idx * 30000);
  });
}

function getPageOptions (url) {
  return new Promise(function (resolve, reject) {
    var page = webpage.create();
    console.log('Requesting ' + url + '...');
    page.open(url + '?redirect=no', function (status) {
      if (status === 'success') {
        return resolve(page.evaluate(function () {
          return Drupal.settings.tesla;
        }));
      } else {
        return resolve(null);
      }
    });
  });
}

var models = ['models', 'modelx'];
Promise.each(models.map(function (model, idx) {
  return getI18nLinks(model, idx);
}), function (linksObj) {
  console.log('Writing ' + linksObj.links.length + ' i18n URLs...');
  fs.write(
    'data/' + linksObj.model + '/locale-urls.json',
    JSON.stringify(linksObj.links, null, 2),
    'w'
  );

  var promises = linksObj.links.map(function (link) {
    return getPageOptions(link);
  });
  return Promise.each(promises, function (settingsObj, idx) {
    if (settingsObj) {
      var filePath = 'data/' + linksObj.model + '/' + settingsObj.locale + '.json';
      console.log(
        'Writing `tesla` object to JSON for ' + settingsObj.locale + ' at ' + filePath
      );
      fs.write(
        filePath,
        JSON.stringify(settingsObj, null, 2),
        'w'
      );
    } else {
      console.log('Error fetching ' + linksObj.links[idx]);
    }
  }).catch(function (err) {
    console.log(err);
  });
}).then(function () {
  console.log('Done');
  phantom.exit();
}).catch(function (err) {
  console.log(err);
});
