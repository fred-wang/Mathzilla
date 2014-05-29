/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

self.port.on("send-data", function (aData) {
  document.body.setAttribute("dir", aData.dir);
  var local = aData.local;
  for (var s in local) {
    var elements = document.getElementsByClassName(s);
    for (var i = 0; i < elements.length; i++) {
      elements[i].textContent = local[s];
    }
  }

  document.getElementById("CancelButton").addEventListener("click",
    function () { self.port.emit("cancel"); }
  );
});

