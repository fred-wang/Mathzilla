/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Load the menu-cookie.js content script for all Web pages. */
var pageMod = require("sdk/page-mod").PageMod({
  include: "*",
  contentScriptFile: require("sdk/self").data.url("menu-cookie.js"),
  contentScriptWhen: "start"
});
