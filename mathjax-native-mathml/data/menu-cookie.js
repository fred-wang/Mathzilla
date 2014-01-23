/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Create a mjx.menu cookie for this document and indicate that the NativeMML
   output mode is selected. */
var cookie = "mjx.menu=" + escape("renderer:NativeMML");
document.cookie = cookie + "; path=/";

/* Delete the cookie once the page is loaded. We do not want to keep a cookie
   for each domain visited and most pages using MathJax will already have
   read it during MathJax's startup sequence. */
var listener = function() {
  document.cookie = "mjx.menu=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  window.removeEventListener("load", listener, false);
}
window.addEventListener("load", listener, false);

/* Redefine MathJax's PreTranslate (see unpacked/jax/output/NativeMML/jax.js) */
var newPreTranslate = function (state) {
  var scripts = state.jax[this.id];
  for (var i = 0; i < scripts.length; i++) {
    var script = scripts[i]; if (!script.parentNode) continue;
    // Remove any existing output
    var prev = script.previousSibling;
    if (prev && prev.className === "MathJax_MathML")
      prev.parentNode.removeChild(prev);
    // Add the MathJax span
    var jax = script.MathJax.elementJax; if (!jax) continue;
    var math = jax.root; jax.NativeMML = {};
    var type = (math.Get("display") === "block" ? "div" : "span");
    var span = MathJax.HTML.Element(type,{
      className: "MathJax_MathML", id:jax.inputID+"-Frame"
    },[["span",{
      className:"MathJax_MathContainer", isMathJax: true, jaxID:this.id,
    },[["span",{isMathJax:true}]]
    ]]);
    script.parentNode.insertBefore(span,script);
  }
};

/* Insert a MathJax config block that will wait for the NativeMML Jax to become
   ready and will then perform some modifications to the MathJax code. We try to
   avoid some rendering and performance bugs:
   - Do not insert inline-block span around the <math>.
   - Do not rescale the text size.
   - Do not modify the <math> width.
   TODO: remove more MathJax's workarounds once the bugs are fixed in Gecko.
*/
var xMathJaxConfig = document.createElement("script");
xMathJaxConfig.type = "text/x-mathjax-config";
xMathJaxConfig.textContent =
  "MathJax.Hub.Register.StartupHook(\"NativeMML Jax Ready\", function () {" +
    "MathJax.OutputJax.NativeMML.Augment({" +
      "preTranslate: " + newPreTranslate.toString() +
    "});" +
    "MathJax.OutputJax.NativeMML.widthBug = false;" +
  "})";
document.head.appendChild(xMathJaxConfig);
