/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var {Cc, Ci} = require("chrome");
var MathMLNameSpace = "http://www.w3.org/1998/Math/MathML";

exports.copy = function(aMathMLCode) {
  // Create a transferable instance.
  var transferable = Cc["@mozilla.org/widget/transferable;1"].
    createInstance(Ci.nsITransferable);

  // Create a SupportsString to store the MathML.
  var mathString =
    Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
  mathString.data = aMathMLCode;
  var mathStringLength = 2 * aMathMLCode.length;

  // XXXfredw: add MathML flavors?
  // http://www.w3.org/TR/MathML3/chapter6.html#world-int-transfers

  // Add the MathML code as normal HTML5 flavor, so that it can be pasted into
  // other applications (Thunderbird, MDN, etc).
  transferable.addDataFlavor("text/html");
  transferable.setTransferData("text/html", mathString, mathStringLength);

  // Add the MathML source, so that it can be pasted into text editor.
  transferable.addDataFlavor("text/unicode");
  transferable.setTransferData("text/unicode", mathString, mathStringLength);

  // Copy the content of the transferable into the clipboard.
  var clipboard =
    Cc["@mozilla.org/widget/clipboard;1"].getService(Ci.nsIClipboard);
  clipboard.setData(transferable, null,
                    Ci.nsIClipboard.kGlobalClipboard);
}
