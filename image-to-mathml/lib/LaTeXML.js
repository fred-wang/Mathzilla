/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This modules communicates with the LaTeXML Web service.

var Request = require("sdk/request").Request,
  prefs = require('sdk/simple-prefs').prefs;

var gMathLaTeXMLUrl = "http://gw125.iu.xsede.org:8888",
  gMathDefaultLaTeXMLSetting = "format=xhtml&whatsin=math&whatsout=math&pmml&cmml&nodefaultresources&preload=LaTeX.pool&preload=article.cls&preload=amsmath.sty&preload=amsthm.sty&preload=amstext.sty&preload=amssymb.sty&preload=eucal.sty&preload=%5Bdvipsnames%5Dxcolor.sty&preload=url.sty&preload=hyperref.sty&preload=%5Bids%5Dlatexml.sty&preload=texvc";

exports.addWorker = function(aWorker) {
  aWorker.port.on("latexml-request", function(aLaTeX) {
    Request({
      url: gMathLaTeXMLUrl + "?" + gMathDefaultLaTeXMLSetting +
           "&tex=literal:" + encodeURIComponent(aLaTeX),
      onComplete: function (aResponse) {
        var json = aResponse.json;
        if (!json.result && prefs["enableDebug"]) {
          console.warn("LaTeXML failed to convert '" + aLaTeX + "'\n" +
                       JSON.stringify(json) + "\n" +
                       "***********************************************");
        }
        json.input = aLaTeX;
        aWorker.port.emit("latexml-response", json);
      }
    }).post();
  });
}
