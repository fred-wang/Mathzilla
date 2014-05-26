/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";
var gStyleElement = null;

// Update the CSS rules for the MathML rendering.
function updateStyle(aPrefs) {
    var mathCSS = "";
    var ruleEnd = aPrefs.mathFontImportant ? " !important;" : ";"
    if (!gStyleElement) {
      return;
    }
    if (aPrefs.mathFontFamily !== "") {
      aPrefs.mathFontFamily.replace("'", "\\'");
      mathCSS += "font-family: '" + aPrefs.mathFontFamily + "'" + ruleEnd;
    }
    if (aPrefs.mathFontScale > 0 && aPrefs.mathFontScale !== 100) {
      mathCSS += "font-size:" + aPrefs.mathFontScale + "%" + ruleEnd;
    }
    gStyleElement.textContent = "/* MathML Font Settings */\n";
    if (mathCSS !== "") {
      gStyleElement.textContent +=
        "@namespace m 'http://www.w3.org/1998/Math/MathML';" +
        "m|math {" + mathCSS + "}"
    }
};

// Create the <style> element.
self.port.on("set-style", function(aPrefs) {
  gStyleElement = document.createElement("style");
  gStyleElement.type = "text/css";
  updateStyle(aPrefs);
  if (document.head) {
    document.head.appendChild(gStyleElement);
  }
});

// Update the content of the <style> element.
self.port.on("update-style", function(aPrefs) {
  updateStyle(aPrefs);
});

// Remove the <style> element.
self.port.on("detach", function() {
  var parent = gStyleElement.parentNode;
  if (parent) {
    parent.removeChild(gStyleElement);
  }
});
