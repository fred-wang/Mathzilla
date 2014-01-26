/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var TeXZilla = require("./TeXZilla");
var {Cc, Ci} = require("chrome");
TeXZilla.setDOMParser(Cc["@mozilla.org/xmlextras/domparser;1"].
                      createInstance(Ci.nsIDOMParser));

exports["test toMathMLString"] = function(assert) {
    assert.ok(TeXZilla.toMathMLString("\\sqrt{\\frac{x}{2}+y}") == '<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><msqrt><mrow><mfrac><mi>x</mi><mn>2</mn></mfrac><mo>+</mo><mi>y</mi></mrow></msqrt><annotation encoding="TeX">\\sqrt{\\frac{x}{2}+y}</annotation></semantics></math>', "toMathMLString works");
}

exports["test toMathML and getTeXSource"] = function(assert) {
  assert.ok(TeXZilla.getTeXSource(TeXZilla.toMathML("\\sqrt{\\frac{x}{2}+y}")) == "\\sqrt{\\frac{x}{2}+y}", "toMathML and getTeXSource work");
}

require("sdk/test").run(exports);
