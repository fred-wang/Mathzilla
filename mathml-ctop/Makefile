# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

include config

CTOP_SVN = ctop
CTOP_CTOP_XSL = ctop.xsl
CTOP_MML3FF_XSL = mml3ff.xsl

MATHML_CTOP = MathML-ctop
MATHML_CTOP_XPI = mathml-ctop.xpi
MATHML_MML3FF = MathML-mml3ff
MATHML_MML3FF_XPI = mathml-mml3ff.xpi

BOOTSTRAP_JS = bootstrap.js
CHROME_MANIFEST = chrome.manifest
INSTALL_RDF = install.rdf
STYLESHEET_XSL = stylesheet.xsl

.PHONY: clean ctop mml3ff

all: download ctop mml3ff xpi

clean:
	@ echo "Removing temporary files..."
	@ rm -rf $(CTOP_SVN)
	@ rm -f $(MATHML_CTOP)/$(STYLESHEET_XSL)
	@ rm -rf $(MATHML_MML3FF)

download:
	@ echo "Downloading ctop..."
	@ $(SVN) checkout $(CTOP_REPOSITORY) $(CTOP_SVN)

ctop:
	@ echo "Generating $(CTOP_CTOP_XSL)..."
	@ $(PERL) make-stylesheet.perl $(CTOP_SVN)/$(CTOP_CTOP_XSL) > $(MATHML_CTOP)/$(STYLESHEET_XSL)

mml3ff:
	@ echo "Creating $(MATHML_MML3FF)/..."
	@ rm -rf $(MATHML_MML3FF)
	@ cp -r $(MATHML_CTOP) $(MATHML_MML3FF)
	@ cp $(MATHML_CTOP)/$(INSTALL_RDF) $(MATHML_MML3FF)/
	@ ls $(MATHML_MML3FF)/* | grep -v $(STYLESHEET_XSL) | xargs $(SED) -i 's/$(MATHML_CTOP)/$(MATHML_MML3FF)/g'
	@ echo "Generating $(CTOP_MML3FF_XSL)..."
	@ cp $(CTOP_SVN)/$(CTOP_MML3FF_XSL) $(MATHML_MML3FF)/$(STYLESHEET_XSL)
#	@ $(PERL) make-stylesheet.perl $(CTOP_SVN)/$(CTOP_MML3FF_XSL) > $(MATHML_MML3FF)/$(STYLESHEET_XSL)

xpi:
	@ echo "Creating $(MATHML_CTOP_XPI)..."
	@ cd $(MATHML_CTOP) ; $(ZIP) -r ../$(MATHML_CTOP_XPI) *
	@ echo "Creating $(MATHML_MML3FF_XPI)..."
	@ mkdir -p $(MATHML_MML3FF) ; cd $(MATHML_MML3FF) ; $(ZIP) -r ../$(MATHML_MML3FF_XPI) *
