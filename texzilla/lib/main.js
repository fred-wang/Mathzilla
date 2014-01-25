/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var data    = require("sdk/self").data;
var widgets = require("sdk/widget");
var tabs    = require("sdk/tabs");

// add a widget to open the TeXZilla editor
var widget = widgets.Widget({
  id: "texzilla-editor",
  label: "TeXZilla Editor",
  contentURL: data.url("logo.svg"),
  onClick: function() {
    tabs.open(data.url("index.html"));
  }
});