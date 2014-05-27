# mathml-fonts

This directory contains the sources of the mathml-fonts extension, which adds
mathematical fonts necessary for Gecko's MathML engine (in WOFF format) and
automatically attachs to each page a CSS style sheet with `@font-face` rules to
load the fonts. To build it, do:

    ./configure
    make

Users should report any bug to the
[GitHub tracker](https://github.com/fred-wang/Mathzilla/issues).
