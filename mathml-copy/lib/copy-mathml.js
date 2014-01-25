/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var {Cc, Ci} = require("chrome");
var MathMLNameSpace = "http://www.w3.org/1998/Math/MathML";

// Instantiate a SupportsString.
function SupportsString(aString)
{
  var rv =
    Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
  rv.data = aString;
  return rv;
}

// Parse a string into a MathML document and return the <math> root.
function ParseMathMLDocument(aString)
{
  var parser =
    Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);
  return parser.parseFromString(aString, "application/xml").documentElement;
}

// Try and find an <annotation> tag that has one of the specified encoding.
function GetAnnotation(aMathMLElement, aEncodingList)
{
  if (aMathMLElement.tagName === "semantics") {
    // It is a semantics element, check if one of its annotation children has
    // the desired encoding.
    var children = aMathMLElement.children;
    for (var i = 0; i < children.length; i++) {
      if (children[i].namespaceURI === MathMLNameSpace &&
          children[i].localName === "annotation" &&
          aEncodingList.indexOf(children[i].getAttribute("encoding")) !== -1) {
        return children[i].textContent;
      }
    }
  } else if (aMathMLElement.childElementCount === 1) {
    // The element has only one child, apply the search recursively.
    return GetAnnotation(aMathMLElement.firstElementChild, aEncodingList);
  }

  return null;
}

exports.copy = function(aMathMLCode, aEncodingList) {
  // Create a transferable instance.
  var transferable = Cc["@mozilla.org/widget/transferable;1"].
    createInstance(Ci.nsITransferable);

  // XXXfredw: add MathML flavors?
  // http://www.w3.org/TR/MathML3/chapter6.html#world-int-transfers

  if (!aEncodingList) {
    // Add the MathML code as normal HTML5 flavor, so that it can be pasted in
    // other applications (Thunderbird, MDN, etc).
    transferable.addDataFlavor("text/html");
    transferable.setTransferData("text/html", SupportsString(aMathMLCode),
                                 2 * aMathMLCode.length);
  }

  // Add a text flavor. Try to use an annotation that has one of the specified
  // encoding and otherwise fallback to the MathML source.
  var text = aMathMLCode;
  if (aEncodingList) {
    var annotation = GetAnnotation(ParseMathMLDocument(aMathMLCode),
                                   aEncodingList);
    if (annotation) text = annotation;
  }
  transferable.addDataFlavor("text/unicode");
  transferable.setTransferData("text/unicode", SupportsString(text),
                               2 * text.length);

  // Copy the content of the transferable into the clipboard.
  var clipboard =
    Cc["@mozilla.org/widget/clipboard;1"].getService(Ci.nsIClipboard);
  clipboard.setData(transferable, null,
                    Ci.nsIClipboard.kGlobalClipboard);
}
