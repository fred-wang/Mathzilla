# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

include config

MARKER_ADD_ON_NAME = ADD_ON_NAME
MARKER_ADD_ON_DESCRIPTION = ADD_ON_DESCRIPTION

SOURCE = src

CTOP_SVN = ctop
CTOP_CTOP_XSL = ctopff.xsl
CTOP_MML3FF_XSL = mml3ff.xsl

MATHML_CTOP = MathML-ctop
MATHML_CTOP_XPI = mathml-ctop.xpi
MATHML_CTOP_DESC = Converter from content MathML to presentation MathML.

MATHML_MML3FF = MathML-mml3ff
MATHML_MML3FF_XPI = mathml-mml3ff.xpi
MATHML_MML3FF_DESC = Add support for MathML 3 features not implemented in Gecko.

INSTALL_RDF = install.rdf
STYLESHEET_XSL = stylesheet.xsl

all: download ctop mml3ff xpi

clean:
	@ echo "Removing temporary files..."
	@ rm -rf $(CTOP_SVN)
	@ rm -rf $(MATHML_CTOP)
	@ rm -rf $(MATHML_MML3FF)
	@ echo "done."
	@ echo

download:
	@ echo "Downloading ctop..."
	@ $(SVN) checkout $(CTOP_REPOSITORY) $(CTOP_SVN)
	@ echo "done."
	@ echo

ctop:
	@ echo "Preparing $(MATHML_CTOP)..."
	@ rm -rf $(MATHML_CTOP)
	@ cp -r $(SOURCE) $(MATHML_CTOP)
	@ ls $(MATHML_CTOP)/* | grep -v $(STYLESHEET_XSL) | xargs $(SED) -i 's/$(MARKER_ADD_ON_NAME)/$(MATHML_CTOP)/g'
	@ $(SED) -i 's/$(MARKER_ADD_ON_DESCRIPTION)/$(MATHML_CTOP_DESC)/g' $(MATHML_CTOP)/$(INSTALL_RDF)
	@ cp $(CTOP_SVN)/$(CTOP_CTOP_XSL) $(MATHML_CTOP)/$(STYLESHEET_XSL)
	@ echo "done."
	@ echo

mml3ff:
	@ echo "Preparing $(MATHML_MML3FF)..."
	@ rm -rf $(MATHML_MML3FF)
	@ cp -r $(SOURCE) $(MATHML_MML3FF)
	@ ls $(MATHML_MML3FF)/* | grep -v $(STYLESHEET_XSL) | xargs $(SED) -i 's/$(MARKER_ADD_ON_NAME)/$(MATHML_MML3FF)/g'
	@ $(SED) -i 's/$(MARKER_ADD_ON_DESCRIPTION)/$(MATHML_MML3FF_DESC)/g' $(MATHML_MML3FF)/$(INSTALL_RDF)
	@ cp $(CTOP_SVN)/$(CTOP_MML3FF_XSL) $(MATHML_MML3FF)/$(STYLESHEET_XSL)
	@ echo "done."
	@ echo

xpi:
	@ echo "Creating $(MATHML_CTOP_XPI) and $(MATHML_MML3FF_XPI)..."
	@ mkdir -p $(MATHML_MML3FF) ; cd $(MATHML_CTOP) ; $(ZIP) -r ../$(MATHML_CTOP_XPI) *
	@ mkdir -p $(MATHML_MML3FF) ; cd $(MATHML_MML3FF) ; $(ZIP) -r ../$(MATHML_MML3FF_XPI) *
	@ echo "done."
	@ echo

.PHONY: clean ctop mml3ff
