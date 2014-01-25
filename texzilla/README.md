License
=======

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.

TeXZilla
========

This is a simple add-on adding a widget to open a tab with the TeXZilla
parser. This might be convenient for example to use this parser offline. This
also contains a TeXZilla module that could be used in other add-ons:

      getTeXSource = function(aMathMLElement)

  returns the TeX source attached to aMathMLElement via a semantics annotation or null if none is found. aMathMLElement is either a string or a MathML DOM element.

      toMathMLString = function(aTeX, aDisplay, aRTL)

  converts the TeX string aTeX into a MathML source. The optional boolean aDisplay and aRTL indicates whether the MathML output should be in display mode and in RTL direction respectively.

      toMathML = function(aTeX, aDisplay, aRTL)

  Same as toMathMLString, but returns a MathML DOM element.

For more details on TeXZilla, see https://github.com/fred-wang/TeXZilla