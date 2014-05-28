/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// This module handles a generic conversion where the list of images are
// specified by a list of CSS selectors, the LaTeX source is given in the alt
// text with delimiters and display="block" is added when necessary.

var images = document.body.querySelectorAll(self.options), i, img, alt, m;
for (i = 0; i < images.length; i++) {
  img = images[i]; alt = img.alt;
  if ((m = alt.match(/^\s*\$\$([^]+)\$\$\s*$/)) ||
      (m = alt.match(/^\s*\\begin{displaymath}([^]+)\\end{displaymath}\s*$/))) {
    fromLaTeXRequest(img, m[1], function(aMath) {
      aMath.setAttribute("display", "block");
    });
  } else if (m = alt.match(/^\s*\$([^]+)\$\s*$/)) {
    fromLaTeXRequest(img, m[1], null);
  }
}
