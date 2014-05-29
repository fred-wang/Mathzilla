/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// This modules communicates with the Mathematica Web service.

// Public Mathematica.fromMathematica function.
exports.fromMathematica = function(aDatabase, aWorker, aMathematica,
                                   aCallback) {
  // Try to get the MathML from the cache.
  aDatabase.getMathML("Mathematica", aMathematica, function(aMathML) {
    if (prefs["MathematicaCache"] && aMathML) {
      aCallback({ input: aMathematica, output: aMathML});
    } else {
      // FIXME: this is not implemented yet.
      aCallback({ input: aMathematica});
    }
  });
};
