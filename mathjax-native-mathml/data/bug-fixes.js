/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var NativeMMLPreTranslate = function (state) {
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

self.port.on("set-bug-fixes", function(aBugConfig) {
  // Insert a MathJax config block that will wait for the MathJax components
  // to become ready and will then perform some modifications to the MathJax
  // code in order to improve performance and fix some rendering bugs.
  var xMathJaxConfig = document.createElement("script");
  xMathJaxConfig.type = "text/x-mathjax-config";
  xMathJaxConfig.textContent = "";

  if (aBugConfig.fixMathJaxNativeMML) {
    // Fix some MathJax bugs in unpacked/jax/output/NativeMML/jax.js
    xMathJaxConfig.textContent +=
    "MathJax.Hub.Register.StartupHook(\"NativeMML Jax Ready\", function () {" +
      "MathJax.OutputJax.NativeMML.Augment({" +
        "preTranslate: " + NativeMMLPreTranslate.toString() +
      "});" +
      "MathJax.OutputJax.NativeMML.ffTableWidthBug = false;" +
      "MathJax.OutputJax.NativeMML.forceReflow = false;" +
      "MathJax.OutputJax.NativeMML.widthBug = false;" +
      "MathJax.OutputJax.NativeMML.spaceWidthBug = false;" +
      "MathJax.OutputJax.NativeMML.mtdWidthBug = false;" +
    "});";
  }

  if (aBugConfig.disableMathJaxMML2jax) {
    // Unregister the mml2jax preprocessor once the extensions are loaded.
    xMathJaxConfig.textContent +=
    "MathJax.Hub.Register.StartupHook(\"End Extensions\", function () {" +
      "if (MathJax.Extension.mml2jax) {" +
      "  for (var i=0,m=MathJax.Hub.preProcessors.hooks.length; i < m; i++) {" +
      "    if (MathJax.Hub.preProcessors.hooks[i].hook ===" +
      "        MathJax.Extension.mml2jax.PreProcess)" +
      "      { MathJax.Hub.preProcessors.hooks.splice(i,1); i--; m--; }" +
      "  }" +
      "}" +
    "});";
  }

  if (document.head) {
    document.head.appendChild(xMathJaxConfig);
  }
});
