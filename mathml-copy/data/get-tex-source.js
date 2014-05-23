/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var MathMLNameSpace = "http://www.w3.org/1998/Math/MathML";
var TeXMimeTypes = ["TeX", "LaTeX", "text/x-tex", "text/x-latex",
                    "application/x-tex", "application/x-latex"];

function GetAnnotation(aNode, aEncodingList)
{
  // Retrieve the <semantics> ancestor and return the first text annotation in
  // the list of encodings, if any.
  while (aNode) {
    if (aNode.nodeType === Node.ELEMENT_NODE &&
        aNode.namespaceURI === MathMLNameSpace &&
        aNode.localName === "semantics") {
      var children = aNode.children;
      for (var i = 0; i < children.length; i++) {
        if (children[i].namespaceURI === MathMLNameSpace &&
            children[i].localName === "annotation" &&
            aEncodingList.indexOf(children[i].
                                  getAttribute("encoding")) !== -1) {
          return children[i].textContent.trim();
        }
      }
      break;
    }
    aNode = aNode.parentNode;
  }
  return null;
}

self.on("click", function (aNode) {
    var source = GetAnnotation(aNode, TeXMimeTypes);
    if (source) {
      self.postMessage(source);
    }
});

self.on("context", function (aNode) {
    return (GetAnnotation(aNode, TeXMimeTypes) !== null)
});
