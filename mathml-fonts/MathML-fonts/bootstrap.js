/* -*- Mode: Javascript; tab-width: 2; indent-tabs-mode:nil; -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function startup(aData, aReason) {
  var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                      .getService(Components.interfaces.nsIStyleSheetService);
  var ios = Components.classes["@mozilla.org/network/io-service;1"]
                      .getService(Components.interfaces.nsIIOService);
  var uri = ios.newURI("resource/mathml.css", null, aData.resourceURI);
  sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
}

function shutdown(aData, aReason) {
  if (aReason != APP_SHUTDOWN) {
    var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                        .getService(Components.interfaces.nsIStyleSheetService);
    var ios = Components.classes["@mozilla.org/network/io-service;1"]
                        .getService(Components.interfaces.nsIIOService);
    var u = ios.newURI("resource/mathml.css", null, aData.resourceURI);
    if(sss.sheetRegistered(u, sss.USER_SHEET)) {
      sss.unregisterSheet(u, sss.USER_SHEET);
    }
  }
}

function install(aData, aReason) {
}

function uninstall(aData, aReason) {
}
