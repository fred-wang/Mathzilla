/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// See LaTeX_NoDelimiters in locale/en-US.properties and lib/predefinedRules.js
// for a description of this script and its options.

var options = JSON.parse(self.options);

self.port.on("convert-images", function () {
  var images, i, img;
  if (options.selectorsNone !== "") {
    images = document.body.querySelectorAll(options.selectorsNone);
    for (i = 0; i < images.length; i++) {
      img = images[i];
      fromLaTeXRequest(img, img.alt, null);
    }
  }
  if (options.selectorsDisplayStyle !== "") {
    images = document.body.querySelectorAll(options.selectorsDisplayStyle);
    for (i = 0; i < images.length; i++) {
      img = images[i];
      fromLaTeXRequest(img, img.alt, function(aMath) {
        aMath.setAttribute("displaystyle", "true");
      });
    }
  }
  if (options.selectorsDisplay !== "") {
    images = document.body.querySelectorAll(options.selectorsDisplay);
    for (i = 0; i < images.length; i++) {
      img = images[i];
      fromLaTeXRequest(img, img.alt, function(aMath) {
        aMath.setAttribute("display", "block");
      });
    }
  }
});
