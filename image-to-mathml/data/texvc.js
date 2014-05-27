/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// This module handles wikis that use the texvc converter.
// We convert all the <img> elements with class "tex" and attach an attribute
// displaystyle="true" to the resulting <math> elements.

var images = document.body.querySelectorAll("img.tex"), i, img;
for (i = 0; i < images.length; i++) {
  img = images[i];
  LaTeXMLRequest(img, img.alt, function(aMath) {
    aMath.setAttribute("displaystyle", "true");
  });
}
