/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var MathMLNameSpace = "http://www.w3.org/1998/Math/MathML";

self.on("click", function (aNode) {
    // Retrieve the <math> ancestor, serialize it and send the source to main.js
    while (aNode) {
        if (aNode.nodeType === Node.ELEMENT_NODE &&
            aNode.namespaceURI === MathMLNameSpace &&
            aNode.localName === "math") {
            var source = (new XMLSerializer()).serializeToString(aNode);
            self.postMessage(source);
            break;
        }
        aNode = aNode.parentNode;
    }
});
