# Mathzilla

The goal of the Mathzilla Project is to provide add-ons or installers to extend
Mozilla products with new MathML-related features:

  - [Mathzilla collection on AMO](https://addons.mozilla.org/collections/fred_wang/mathzilla/)
    - [MathML-ctop](https://addons.mozilla.org/addon/mathml-ctop/)
    - [MathML-mml3ff](https://addons.mozilla.org/addon/mathml-mml3ff/)
    - [MathML-fonts](https://addons.mozilla.org/addon/mathml-fonts/)
    - [FireMath](https://addons.mozilla.org/fr/firefox/addon/firemath/)
  - [MathML-fonts (Windows Installer)](https://developer.mozilla.org/@api/deki/files/6388/=MathML-fonts.msi)
  - [MathML-fonts (experimental Mac Installer)](https://bugzilla.mozilla.org/show_bug.cgi?id=770005#c3)
  - [MathBird](http://disruptive-innovations.com/zoo/MathBird/)

## mathml-ctop

Source of the MathML-ctop and MathML-mml3ff add-ons and the scripts to generate
them. They essentially apply [David Carlisle's ctop stylesheets](http://web-xslt.googlecode.com/svn/trunk/ctop/) to MathML elements.

To build the extension, move into `mathml-fonts/`, edit the config file
(if necessary) and type `make`. You should find generated `mathml-ctop.xpi` and
`mathml-mml3ff` files.

## mathml-fonts

Source of the mathml-fonts extension, which adds mathematical fonts necessary
for Gecko's MathML engine (in WOFF format) and automatically attachs to each
page a CSS style sheet with `@font-face` rules to load the fonts.

The extension is automatically built from the `MathML-fonts.zip` archive
[available on Mozilla MathML Project page](https://developer.mozilla.org/en/Mozilla_MathML_Project/Fonts). It converts odt fonts into woff using
Jonathan Kew's [sfnt2woff tool](http://people.mozilla.org/~jkew/woff/).

To build the extension, move into `mathml-fonts/`, edit the config file
(if necessary) and type `make`. You should find a generated `mathml-fonts.xpi`
file.

### mathml-fonts/MSI

Source of the MathML fonts Windows installer. Instructions on how to build it
are given in `MathML-fonts.wxs`.

### mathml-fonts/MacOSX

See <https://bugzilla.mozilla.org/show_bug.cgi?id=770005>

## mathparser

This is a set of patches to add a mathparser extension to mozilla-central.
Warning: They are no longer maintained. They should probably be rewritten
and integrated directly to mozilla-central.

1. Install [GNU bison](http://www.gnu.org/software/bison/) if it is not present on your system.
2. Apply these patches to your sources from mozilla-central, in that order:
  mathparser-base.diff, mathparser-utils.diff, A mathparser-dictionary.diff,
  mathparser-simple.diff A mathparser-itex.diff.
3. Enable the mathparser extension:
  `ac_add_options --enable-extensions=default,mathparser`
4. Compile Mozilla
5. Once the build is complete, you should have mathparser available in the
add-on menu. You should also find an XPI in your objdir:
`dist/xpi-stage/mathparser.xpi`

You can test the parser with `mathzilla-parser.xhtml`

For itex2MML commands, see
  - <http://xbeta.org/wiki/show/itex>
  - <http://golem.ph.utexas.edu/~distler/blog/itex2MMLcommands.html>
  - <http://golem.ph.utexas.edu/~distler/WebTeX/docs/wtxsec7.html#ARRAY>

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

Sources for the mathzilla add-on. This is experimental, I need to update them
to be compatible with future versions of Mozilla Add-on SDK.
