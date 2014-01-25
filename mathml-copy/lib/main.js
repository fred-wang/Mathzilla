/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var contextMenu = require("sdk/context-menu");
var data        = require("sdk/self").data;
var clipboard   = require("sdk/clipboard");
var copyMathML  = require("copy-mathml");

// Add a menu item to copy the <math> source and element.
contextMenu.Item({
  label: "Copy MathML Formula",
  context: contextMenu.SelectorContext('math'),
  contentScriptFile: data.url("get-mathml-source.js"),
  onMessage: function(aSource) {
    copyMathML.copy(aSource);
  }
});

// Add a menu item to copy the TeX annotation attached to a <math> element.
// XXXfredw For Firefox >= 29, use PredicateContext to only show this menu item
// when a TeX annotation is actually available.
contextMenu.Item({
  label: "Copy TeX Source",
  context: contextMenu.SelectorContext('math'),
  contentScriptFile: data.url("get-mathml-source.js"),
  onMessage: function(aSource) {
    copyMathML.copy(aSource,
                    ["TeX", "LaTeX", "text/x-tex", "text/x-latex",
                     "application/x-tex", "application/x-latex"]);
  }
});