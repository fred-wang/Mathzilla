/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var data    = require("sdk/self").data;
var action  = require("sdk/ui/button/action")
var tabs    = require("sdk/tabs");

action.ActionButton({
  id: "texzilla-editor",
  label: "TeXZilla Editor",
  icon: {
    "32": data.url("logo.png"),
  },
  onClick: function() {
    tabs.open(data.url("index.html"));
  }
});
