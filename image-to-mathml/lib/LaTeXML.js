/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This modules communicates with the LaTeXML Web service.

var Request = require("sdk/request").Request,
  simplePrefs = require('sdk/simple-prefs'),
  prefs = simplePrefs.prefs,
  { indexedDB } = require('sdk/indexed-db');

// Initialize a database to store MathML output.
var database = {};
database.onerror = function(e) {
  console.error(e.value);
}
var databaseVersion = 1;
var request = indexedDB.open("LaTeXML", databaseVersion);
request.onerror = database.onerror;
request.onsuccess = function(e) {
  database.db = e.target.result;
};
request.onupgradeneeded = function(e) {
  var db = e.target.result;
  e.target.transaction.onerror = database.onerror;
  if(db.objectStoreNames.contains("MathML")) {
    db.deleteObjectStore("MathML");
  }
  db.createObjectStore("MathML");
};

database.clearMathML = function()
{
  if (!this.db) {
    return;
  }
  this.db.transaction(["MathML"], "readwrite").objectStore("MathML").clear();
}

database.addMathML = function(aLaTeX, aMathML)
{
  if (!this.db) {
    return;
  }
  var store = this.db.
    transaction(["MathML"], "readwrite").objectStore("MathML");
  var request = store.put(aMathML, aLaTeX);
  request.onerror = this.onerror;
};

database.getMathML = function(aLaTeX, aCallback)
{
  if (!this.db) {
    aCallback(null);
  }
  var store = this.db.
    transaction(["MathML"], "readwrite").objectStore("MathML");
  var request = store.get(aLaTeX);
  request.onerror = this.onerror;
  request.onsuccess = function() {
    aCallback(request.result);
  }
}

// Clear the MathML storage if the user disable the LaTeXMLCache option.
simplePrefs.on("LaTeXMLCache", function() {
  if (!prefs["LaTeXMLCache"]) {
    database.clearMathML();
  }
});

// Determine the URL for the POST request.
function getLaTeXMLUrl(aLaTeX)
{
  var LaTeXMLSetting = "format=xhtml&whatsin=math&whatsout=math&pmml&nodefaultresources&preload=LaTeX.pool&preload=article.cls&preload=amsmath.sty&preload=amsthm.sty&preload=amstext.sty&preload=amssymb.sty&preload=eucal.sty&preload=%5Bdvipsnames%5Dxcolor.sty&preload=url.sty&preload=hyperref.sty&preload=%5Bids%5Dlatexml.sty&preload=texvc";
  return prefs["LaTeXMLUrl"] + "?" + LaTeXMLSetting + "&tex=literal:" +
    encodeURIComponent(aLaTeX);
}

// Send the LaTeXML request.
function sendLaTeXMLRequest(aWorker, aLaTeX, aCallback, aMaxAttempts) {
  Request({
    url: getLaTeXMLUrl(aLaTeX),
    onComplete: function (aResponse) {
      var json = aResponse.json;
      if (!json || !json.result) {
        // Conversion failed. Either we try again or we give up and submit an
        // empty reply.
        if (aMaxAttempts > 0) {
          sendLaTeXMLRequest(aWorker, aLaTeX, aCallback, aMaxAttempts - 1);
          return;
        }
        console.warn("LaTeXML failed to convert '" + aLaTeX + "'\n" +
                     aResponse.text);
        json = {};
      } else if (prefs["LaTeXMLCache"]) {
        // Cache the result.
        database.addMathML(aLaTeX, json.result);
      }
      aCallback({ input: aLaTeX, output: json.result });
    }
  }).post();
}

// Public LaTeXML.fromLaTeX function.
exports.fromLaTeX = function(aWorker, aLaTeX, aCallback) {
  // Try to get the MathML from the cache.
  database.getMathML(aLaTeX, function(aMathML) {
    if (prefs["LaTeXMLCache"] && aMathML) {
      aCallback({ input: aLaTeX, output: aMathML});
    } else {
      sendLaTeXMLRequest(aWorker, aLaTeX, aCallback,
                         prefs["LaTeXMLMaxAttempts"]);
    }
  });
}
