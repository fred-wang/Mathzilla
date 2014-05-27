# mathparser

**This is no longer maintained. It is deprecated in favor of TeXZilla.**

This is a set of patches to add a mathparser extension to mozilla-central.

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

