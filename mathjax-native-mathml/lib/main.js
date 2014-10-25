/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var data = require("sdk/self").data,
  pageMod = require("sdk/page-mod"),
  prefs = require('sdk/simple-prefs').prefs;

// Modify MathJax's menu preference.
var menuPageMod = {
  include: "*",
  contentScriptFile: data.url("menu-cookie.js"),
  contentScriptWhen: "start",
  onAttach: function(worker) {
    var config = "renderer:NativeMML"; // Force the native MathML output.
    if (prefs["useBrowserContext"]) {
      config += "&;context:Browser";   // Always show the browser context menu.
    }
    if (prefs["disableMathJaxZoom"]) {
      config += "&;zoom:None";         // Disable MathJax's zoom.
    }
    worker.port.emit('set-menu-cookie', config);
  }
};

// Modify MathJax's code to fix performance and rendering issues.
var bugPageMod = {
  include: "*",
  contentScriptFile: data.url("bug-fixes.js"),
  contentScriptWhen: "start",
  onAttach: function(worker) {
    worker.port.emit('set-bug-fixes', {
      disableMathJaxMML2jax: prefs["disableMathJaxMML2jax"],
      fixMathJaxNativeMML: prefs["fixMathJaxNativeMML"]
    });
  }
};

// Add the exclusion list.
var exclusionList = prefs["exclusionList"].trim();
if (exclusionList.length > 0) {
  menuPageMod.exclude = exclusionList.split(",");
  bugPageMod.exclude = menuPageMod.exclude;
}

// Add the page mods
pageMod.PageMod(menuPageMod);
pageMod.PageMod(bugPageMod);
