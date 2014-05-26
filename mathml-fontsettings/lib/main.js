/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

var data = require("sdk/self").data,
  pageMod = require("sdk/page-mod"),
  simplePrefs = require('sdk/simple-prefs'),
  prefs = simplePrefs.prefs,
  contextMenu = require("sdk/context-menu"),
  array = require('sdk/util/array'),
  _ = require("sdk/l10n").get;

// Handle setting/updating the styles in page-mod workers.
var gWorkers = [];
function updateWorkerStyles() {
  for (var i = 0; i < gWorkers.length; i++) {
    gWorkers[i].port.emit("update-style", prefs);
  }
};
pageMod.PageMod({
  include: "*",
  contentScriptFile: data.url("set-style.js"),
  contentScriptWhen: "start",
  attachTo: ["existing", "top", "frame"],
  onAttach: function(aWorker) {
    aWorker.port.emit("set-style", prefs);
    array.add(gWorkers, aWorker);
    aWorker.on("pageshow", function() { array.add(gWorkers, aWorker); });
    aWorker.on("pagehide", function() { array.remove(gWorkers, aWorker); });
    aWorker.on("detach", function () { array.remove(gWorkers, aWorker); });
  }
});

// Handle preference changes.
simplePrefs.on("mathFontFamily", updateWorkerStyles);
simplePrefs.on("mathFontScale", updateWorkerStyles);
simplePrefs.on("mathFontImportant", updateWorkerStyles);

// Set the font family submenu.
var gMathFonts = [
  "Asana Math",
  "Cambria Math",
  "Latin Modern Math",
  "Lucida Bright Math",
  "Minion Math",
  "Neo Euler",
  "STIX Math",
  "TeX Gyre Bonum Math",
  "TeX Gyre Pagella Math",
  "TeX Gyre Schola Math",
  "TeX Gyre Termes Math",
  "XITS Math"
];
var fontFamilyMenu = contextMenu.Menu({
  label: _("mathFontFamily_title"),
});
fontFamilyMenu.addItem(
  contextMenu.Item({
    label: _("mathFontFamily_default"),
    contentScript: "self.on('click', function () { self.postMessage(); });",
    onMessage: function() {
      prefs["mathFontFamily"] = "";
    }
  })
);
for (var i = 0; i < gMathFonts.length; i++) {
  fontFamilyMenu.addItem(
    contextMenu.Item({
      label: gMathFonts[i],
      contentScript: "self.on('click', function () { self.postMessage(); });",
      onMessage: function() {
        prefs["mathFontFamily"] = this.label;
      }
    })
  );
}

// Set the font scale submenu.
var fontScaleMenu = contextMenu.Menu({
  label: _("mathFontScale_title"),
});
var maxI = 4;
for (var i = -maxI; i <= maxI; i++) {
  fontScaleMenu.addItem(
    contextMenu.Item({
      label: Math.round(100 * Math.pow(2, i/maxI)) + "%",
      contentScript: "self.on('click', function () { self.postMessage(); });",
      onMessage: function() {
        prefs["mathFontScale"] = parseInt(this.label.slice(0, -1));
      }
    })
  );
}

// Set the context menu for the font settings.
contextMenu.Menu({
  label: _("mathFontSettings"),
  context: contextMenu.PageContext(),
  items: [fontFamilyMenu, fontScaleMenu]
});
