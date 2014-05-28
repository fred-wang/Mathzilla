/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This modules communicates with the LaTeXML Web service.

var Request = require("sdk/request").Request,
  prefs = require('sdk/simple-prefs').prefs;

function getLaTeXMLUrl(aLaTeX)
{
  var LaTeXMLSetting = "format=xhtml&whatsin=math&whatsout=math&pmml&nodefaultresources&preload=LaTeX.pool&preload=article.cls&preload=amsmath.sty&preload=amsthm.sty&preload=amstext.sty&preload=amssymb.sty&preload=eucal.sty&preload=%5Bdvipsnames%5Dxcolor.sty&preload=url.sty&preload=hyperref.sty&preload=%5Bids%5Dlatexml.sty&preload=texvc";
  return prefs["LaTeXMLUrl"] + "?" + LaTeXMLSetting + "&tex=literal:" +
    encodeURIComponent(aLaTeX);
}

function sendLaTeXMLRequest(aWorker, aLaTeX, aCallback, aMaxAttempt) {
  Request({
    url: getLaTeXMLUrl(aLaTeX),
    onComplete: function (aResponse) {
      var json = aResponse.json;
      if (!json || !json.result) {
        // Conversion failed. Either we try again or we give up and submit an
        // empty reply.
        if (aMaxAttempt > 0) {
          sendLaTeXMLRequest(aWorker, aLaTeX, aCallback, aMaxAttempt - 1);
          return;
        }
        console.warn("LaTeXML failed to convert '" + aLaTeX + "'\n" +
                     aResponse.text);
        json = {};
      }
      json.input = aLaTeX;
      aCallback(json);
    }
  }).post();
}

exports.fromLaTeX = function(aWorker, aLaTeX, aCallback) {
  sendLaTeXMLRequest(aWorker, aLaTeX, aCallback, prefs["LaTeXMLMaxAttempt"]);
}
