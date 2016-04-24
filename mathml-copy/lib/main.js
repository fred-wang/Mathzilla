/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var contextMenu = require("sdk/context-menu");
var data        = require("sdk/self").data;
var clipboard   = require("sdk/clipboard");
var copyMathML  = require("./copy-mathml");
var _           = require("sdk/l10n").get;

// Add a menu item to copy the <math> source and element.
contextMenu.Item({
  label: _("copy_mathml"),
  context: contextMenu.SelectorContext("math"),
  contentScriptFile: data.url("get-mathml-source.js"),
  onMessage: function(aSource) {
    copyMathML.copy(aSource);
  }
});

// Add a menu item to copy the TeX annotation attached to a <semantics> element.
contextMenu.Item({
  label: _("copy_tex"),
  context: contextMenu.SelectorContext("semantics"),
  contentScriptFile: data.url("get-tex-source.js"),
  onMessage: function(aSource) {
    clipboard.set(aSource);
  }
});

// Add a submenu enumerating the annotations attached to a <semantics> element.
contextMenu.Menu({
  label: _("copy_annotation"),
  context: contextMenu.SelectorContext("semantics"),
  contentScriptFile: data.url("get-annotations.js"),
  onMessage: function(aMessage) {
      if (aMessage.name == "set_items") {
        // Retrieve all the annotations and set the items of the submenu.
        var items = [];
        for (var i = 0; i < aMessage.items.length; i++) {
          items.push(contextMenu.Item(aMessage.items[i]));
        }
        this.items = items;
      } else if (aMessage.name == "copy_source") {
        clipboard.set(aMessage.source);
      }
  },
  // dummy item to force the submenu to be displayed the first time the context
  // menu is opened.
  items: [contextMenu.Item({ label: "?" })]
});
