/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// See LaTeX_Delimiters in locale/en-US.properties and lib/predefinedRules.js
// for a description of this script and its options.

var options = JSON.parse(self.options);

self.port.on("convert-images", function () {
  var images = document.body.querySelectorAll(options.selectors),
      i, img, alt, m;
  for (i = 0; i < images.length; i++) {
    img = images[i]; alt = img.alt;
    if ((m = alt.match(/^\s*\$\$([^]+)\$\$\s*$/)) ||
        (m = alt.match(/^\s*\\\[([^]+)\\\]\s*$/)) ||
        (m =
         alt.match(/^\s*\\begin{displaymath}([^]+)\\end{displaymath}\s*$/))) {
      // Display equations
      fromLaTeXRequest(img, m[1], function(aMath) {
        if (options.useDisplayAttribute) {
          aMath.setAttribute("display", "block");
        } else {
          aMath.setAttribute("displaystyle", "true");
        }
      });
    } else if ((m = alt.match(/^\s*\$([^]+)\$\s*$/)) ||
               (m = alt.match(/^\s*\\\(([^]+)\\\)\s*$/))) {
      // Inline equations
      fromLaTeXRequest(img, m[1], null);
    }
  }
});
