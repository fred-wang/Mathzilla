# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

include config

CTOP_SVN = ctop
CTOP_XSL = ctop.xsl
MATHML_CTOP = MathML-ctop
MATHML_CTOP_JSM = ctop.jsm
MATHML_CTOP_XPI = mathml-ctop.xpi

all: download ctopjsm xpi

clean:
	@ echo "Removing temporary files..."
	@ rm -rf $(CTOP_SVN)
	@ rm -f $(MATHML_CTOP)/$(MATHML_CTOP_JSM)

download:
	@ echo "Downloading ctop..."
	@ $(SVN) checkout $(CTOP_REPOSITORY) $(CTOP_SVN)

ctopjsm:
	@ echo "Generation ctop.jsm..."
	@ $(PERL) make-ctop-jsm.perl $(CTOP_SVN)/$(CTOP_XSL) > $(MATHML_CTOP)/$(MATHML_CTOP_JSM)

xpi:
	@ echo "Creating the xpi file..."
	@ cd $(MATHML_CTOP) ; $(ZIP) -r ../$(MATHML_CTOP_XPI) *
