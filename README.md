# Mathzilla

The goal of the Mathzilla Project is to provide add-ons or installers to extend
Mozilla products with new MathML-related features.

Mathzilla collection on AMO: <https://addons.mozilla.org/collections/fred_wang/mathzilla/>

MathML-ctop: <https://addons.mozilla.org/addon/mathml-ctop/>

MathML-mml3ff: <https://addons.mozilla.org/addon/mathml-mml3ff/>

MathML-fonts: <https://addons.mozilla.org/addon/mathml-fonts/>, 
<https://developer.mozilla.org/@api/deki/files/6388/=MathML-fonts.msi>,
<https://bugzilla.mozilla.org/show_bug.cgi?id=770005#c3>

FireMath: <https://addons.mozilla.org/fr/firefox/addon/firemath/

MathBird: <http://disruptive-innovations.com/zoo/MathBird/>

## mathml-ctop

...

## mathml-fonts

Source of the mathml-fonts extension, which adds mathematical fonts necessary
for Gecko's MathML engine (in WOFF format) and automatically attachs to each
page a CSS style sheet with @font-face rules to load the fonts.

The extension is automatically built from the MathML-fonts.zip archive available
on Mozilla MathML Project page [1]. It converts odt fonts into woff using
Jonathan Kew's sfnt2woff tool [2].

To build the extension, move into mathml-fonts/, edit the config file
(if necessary) and type "make". You will normally find a generated
mathml-fonts.xpi file.

[1] MathML Fonts: <https://developer.mozilla.org/en/Mozilla_MathML_Project/Fonts>
[2] sfnt2woff: <http://people.mozilla.org/~jkew/woff/>

### mathml-fonts/MSI

Source of the MathML fonts Windows installer. Instructions on how to build it
are given in MathML-fonts.wxs.

### mathml-fonts/MacOSX???

See <https://bugzilla.mozilla.org/show_bug.cgi?id=770005>

## mathparser

This is a set of patches to add a mathparser extension to mozilla-central.
Warning: They are no longer maintained. They should probably be rewritten
and integrated directly to mozilla-central.

I) Install GNU bison if it is not present on your system.
   <http://www.gnu.org/software/bison/>

II) Apply these patches to your sources from mozilla-central:
  0 A mathparser-base.diff
  1 A mathparser-utils.diff
  2 A mathparser-dictionary.diff
  3 A mathparser-simple.diff
  4 A mathparser-itex.diff

III) Enable the mathparser extension:
  ac_add_options --enable-extensions=default,mathparser

IV) Compile Mozilla

V) Once the build is complete, you should have mathparser available in the
add-on menu. You should also find an XPI in your objdir:
  dist/xpi-stage/mathparser.xpi 

You can test the parser with mathzilla-parser.xhtml

For itex2MML commands, see
   <http://xbeta.org/wiki/show/itex>
   <http://golem.ph.utexas.edu/~distler/blog/itex2MMLcommands.html>
   <http://golem.ph.utexas.edu/~distler/WebTeX/docs/wtxsec7.html#ARRAY>

The idl interface of nsIMathParser is:
  const short MATHPARSER_MODE_SIMPLE     = 0;
  const short MATHPARSER_MODE_ITEX       = 1;
  const short MATHPARSER_NUMBER_OF_MODES = 2;

  attribute short   parsingMode;
  attribute boolean reportErrors;
  attribute boolean splitMiTokens;

  nsIDOMElement parse(in nsIDOMDocument aDocument,
                      in AString        aString);

## mathzilla

Sources for the mathzilla add-on.
This is experimental, I need to update them to be compatible with future
versions of Mozilla Add-on SDK.
