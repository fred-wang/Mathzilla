/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// Associative array indexed by the LaTeX source. The elements are arrays of
// JSON objects
//
//   { image: ...,
//     callback: function(aMath) { ... } }
//
// where image is the <img> element to convert into a <math> element and the
// callback function takes the resulting <math> element as argument.
let pendingFromLaTeXRequest = {};

// Send a request to convert LaTeX to MathML.
function fromLaTeXRequest(aImage, aLaTeX, aCallback) {
  var data = { image: aImage, callback: aCallback };
  if (pendingFromLaTeXRequest[aLaTeX]) {
    // The same request has already been sent in a previous call. Let's add this
    // to the array of JSON objects.
    pendingFromLaTeXRequest[aLaTeX].push(data);
  } else {
    // Create a one-element array and send a new request.
    pendingFromLaTeXRequest[aLaTeX] = [data];
    self.port.emit("fromLaTeX-request", aLaTeX);
  }
}

// Handle the fromLaTeX response.
self.port.on("fromLaTeX-response", function (aResponse) {
  var JSONarray, data, previous, parent, i;
  if (aResponse.result) {
    // Conversion succeeded. Replace all the images by <math> elements.
    JSONarray = pendingFromLaTeXRequest[aResponse.input];
    for (i = 0; i < JSONarray.length; i++) {
      data = JSONarray[i];
      previous = data.image.previousElementSibling;
      parent = data.image.parentNode;
      data.image.outerHTML = aResponse.result;
      if (data.callback) {
        // Execute the callback to do some postprocessing on the <math> tag.
        data.callback(previous ?
                      previous.nextElementSibling : parent.firstElementChild);
      }
    }
  }
  // Remove this request.
  delete pendingFromLaTeXRequest[aResponse.input];
});
