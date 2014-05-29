/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// This module communicates with the LaTeXML Web service.

var Request = require("sdk/request").Request,
  simplePrefs = require('sdk/simple-prefs'),
  prefs = simplePrefs.prefs;

function generatePreloadComponents(aPreloadList)
{
  var components = "";
  var list = aPreloadList.split(",").map(function(value) {
    components += "&preload=" + encodeURIComponent(value);
  });
  return components;
}

// Determine the URL for the POST request.
function getLaTeXMLUrl(aPreloadList, aLaTeX)
{
  var url = prefs.LaTeXMLUrl;
  url += "?format=xhtml&whatsin=math&whatsout=math&pmml&nodefaultresources";
  url += generatePreloadComponents(prefs.LaTeXMLPreload);
  url += generatePreloadComponents(aPreloadList);
  url += "&tex=" + encodeURIComponent(aLaTeX);
  return url;
}

// Send the LaTeXML request.
function sendLaTeXMLRequest(aDatabase, aWorker, aPreloadList, aLaTeX, aCallback,
                            aMaxAttempts) {
   Request({
    url: getLaTeXMLUrl(aPreloadList, aLaTeX),
    onComplete: function (aResponse) {
      var json = aResponse.json;
      if (!json || !json.result) {
        // Conversion failed. Either we try again or we give up and submit an
        // empty reply.
        if (aMaxAttempts > 0) {
          sendLaTeXMLRequest(aDatabase, aWorker, aPreloadList, aLaTeX,
                             aCallback, aMaxAttempts - 1);
          return;
        }
        console.warn("LaTeXML failed to convert '" + aLaTeX + "'\n" +
                     aResponse.text);
        json = {};
      } else if (prefs.LaTeXMLCache) {
        // Cache the result.
        aDatabase.putMathML("LaTeXML", aLaTeX, json.result);
      }
      aCallback({ input: aLaTeX, output: json.result });
    }
  }).post();
}

// Public LaTeXML.fromLaTeX function.
exports.fromLaTeX = function(aDatabase, aWorker, aPreloadList, aLaTeX,
                             aCallback) {
  // Try to get the MathML from the cache.
  aDatabase.getMathML("LaTeXML", aLaTeX, function(aMathML) {
    if (prefs.LaTeXMLCache && aMathML) {
      aCallback({ input: aLaTeX, output: aMathML});
    } else {
      sendLaTeXMLRequest(aDatabase, aWorker, aPreloadList, aLaTeX, aCallback,
                         prefs.LaTeXMLMaxAttempts);
    }
  });
};
