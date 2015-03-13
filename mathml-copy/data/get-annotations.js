/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var MathMLNameSpace = "http://www.w3.org/1998/Math/MathML";

function GetAnnotations(aNode)
{
  var annotations = [];

  // Retrieve the <semantics> ancestor and return the list of annotations.
  while (aNode) {
    if (aNode.nodeType === Node.ELEMENT_NODE &&
        aNode.namespaceURI === MathMLNameSpace &&
        aNode.localName === "semantics") {
      var children = aNode.children;
      var serializer = new XMLSerializer();
      for (var i = 0; i < children.length; i++) {
        if (children[i].namespaceURI === MathMLNameSpace) {
          if (children[i].localName === "annotation") {
            // Copy the text content of <annotation>.
            annotations.push({
              label: children[i].getAttribute("encoding"),
              data: children[i].textContent.trim()
            });
          } else if (children[i].localName === "annotation-xml" &&
                     children[i].children.length == 1) {
            // Copy the serialized unique child of <annotation-xml>.
            annotations.push({
              label: children[i].getAttribute("encoding"),
              data: serializer.serializeToString(children[i].children[0])
            })
          }
        }
      }
      break;
    }
    aNode = aNode.parentNode;
  }
  return annotations;
}

self.on("click", function (aNode, aData) {
    if (aData) {
      self.postMessage({ name: "copy_source", source: aData});
    }
});

self.on("context", function (aNode) {
    var annotations = GetAnnotations(aNode);
    if (annotations.length) {
      var items = [];
      self.postMessage({ name: "set_items", items: annotations});
    }
    return annotations.length;
});
