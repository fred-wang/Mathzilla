/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var _           = require("sdk/l10n").get;
var contextMenu = require("sdk/context-menu");
var data        = require("sdk/self").data;
var tabs = require("sdk/tabs");

// FIXME: accessKey does not seem to work.
// See https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Add_a_Context_Menu_Item#Adding_an_access_key
contextMenu.Item({
  label: _("viewPartialSourceForMathMLCmdLabel"),
  accessKey: _("viewPartialSourceCmdAccessKey"),
  context: contextMenu.SelectorContext("math"),
  contentScriptFile: data.url("get-mathml-source.js"),
  onMessage: function(aSource) {
      // Print invisible characters in a readable way.
      var source = aSource.replace(/[\u2061-\u2064]/g, function(c) {
        var codePoint = c.charCodeAt(0);
        var unicodeName = ["FUNCTION APPLICATION",
                           "INVISIBLE TIMES",
                           "INVISIBLE SEPARATOR",
                           "INVISIBLE PLUS"][codePoint - 0x2061];
        return "&#x" + codePoint.toString(16) + ";<!-- " + unicodeName + " -->";
    });
    // Open a new tab with the MathML source.
    tabs.open({
      url: data.url("view-mathml-source.html"),
      onLoad: function(aTab) {
        aTab.attach({
          contentScriptFile: data.url("view-mathml-source.js")
        }).port.emit("setContent", _("viewMathMLSourceTitle"), source);
      }
    });
  }
});
