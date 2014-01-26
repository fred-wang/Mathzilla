License
=======

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.

TeXZilla
========

This is a simple add-on adding a widget to open a tab with the TeXZilla
parser. This might be convenient for example to use this parser offline. This
also contains a TeXZilla module that could be used in other add-ons:

      TeXZilla.toMathMLString = function(aTeX, aDisplay, aRTL)

  converts the TeX string aTeX into a MathML source. The optional boolean
  aDisplay and aRTL indicates whether the MathML output should be in display
  mode and in RTL direction respectively.

      TeXZilla.toMathML = function(aTeX, aDisplay, aRTL)

  is the same as TeXZilla.toMathMLString, but returns a MathML DOM element. This
  requires to have a DOMParser API available (see TeXZilla.setDOMParser below).

      TeXZilla.getTeXSource = function(aMathMLElement)

  returns the TeX source attached to aMathMLElement via a semantics annotation
  or null if none is found. aMathMLElement is either a string or a MathML DOM
  element. This requires to have a DOMParser API available (see
  TeXZilla.setDOMParser below).

      TeXZilla.setDOMParser = function(aDOMParser)

  sets TeXZilla's DOMParser to the DOMParser instance aDOMParser. TeXZilla
  tries to automatically initialized its DOMParser to `new DOMParser()`.
  Otherwise it remains null and you must use TeXZilla.setDOMParser to set it
  yourself. For example using Mozilla's XPCOM interface:

      TeXZilla.setDOMParser(Components.
                            classes["@mozilla.org/xmlextras/domparser;1"].
                            createInstance(Components.interfaces.nsIDOMParser));

  or for Firefox Add-on SDK:

      var {Cc, Ci} = require("chrome");
      TeXZilla.setDOMParser(Cc["@mozilla.org/xmlextras/domparser;1"].
                            createInstance(Ci.nsIDOMParser));

For more details on TeXZilla, see https://github.com/fred-wang/TeXZilla