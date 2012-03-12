# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1/GPL 2.0/LGPL 2.1
#
# The contents of this file are subject to the Mozilla Public License Version
# 1.1 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at
# http://www.mozilla.org/MPL/
#
# Software distributed under the License is distributed on an "AS IS" basis,
# WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
# for the specific language governing rights and limitations under the
# License.
#
# The Original Code is Mozilla MathML Project.
#
# The Initial Developer of the Original Code is
# Frederic Wang <fred.wang@free.fr>.
# Portions created by the Initial Developer are Copyright (C) 2012
# the Initial Developer. All Rights Reserved.
#
# Contributor(s):
#
# Alternatively, the contents of this file may be used under the terms of
# either the GNU General Public License Version 2 or later (the "GPL"), or
# the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
# in which case the provisions of the GPL or the LGPL are applicable instead
# of those above. If you wish to allow use of your version of this file only
# under the terms of either the GPL or the LGPL, and not to allow others to
# use your version of this file under the terms of the MPL, indicate your
# decision by deleting the provisions above and replace them with the notice
# and other provisions required by the GPL or the LGPL. If you do not delete
# the provisions above, a recipient may use your version of this file under
# the terms of any one of the MPL, the GPL or the LGPL.
#
# ***** END LICENSE BLOCK *****

include config

FONT_FILE_LIST = font-file-list
MATHML_CSS = mathml.css
MATHML_FONTS = MathML-fonts
MATHML_FONTS_XPI = mathml-fonts.xpi
MATHML_FONTS_ZIP = mathml-fonts.zip
RESOURCE = resource
RESOURCE_CHROME_URI = resource://mathml-fonts/MathML-fonts
SECTION_END_MARKER = "DOWNLOADABLE_FONT_SECTION_END"

all: download woff css xpi

clean:
	@ echo "Removing temporary files..."
	@ rm -f $(MATHML_FONTS_ZIP)
	@ rm -f $(MATHML_CSS)
	@ rm -f $(FONT_FILE_LIST)*
	@ rm -rf $(MATHML_FONTS)/$(RESOURCE)

download:
	@ echo "Downloading MathML fonts..."
	@ $(WGET) $(MATHML_FONTS_URI) -O $(MATHML_FONTS_ZIP)

	@ echo "Downloading mathml.css..."
	@ $(WGET) $(MATHML_CSS_URI) -O $(MATHML_CSS)

woff:
	@ mkdir -p $(MATHML_FONTS)/$(RESOURCE)

	@ echo "Extracting MathML fonts..."
	@ $(UNZIP) -o $(MATHML_FONTS_ZIP) -d $(MATHML_FONTS)/$(RESOURCE)

	@ echo "Converting otf fonts to woff..."
	@ cd $(MATHML_FONTS)/$(RESOURCE)/$(MATHML_FONTS)/ ; \
	  for FONTDIR in `ls`; do \
	    cd $$FONTDIR; \
	    for FONTFILE in `ls *.otf`; do \
	      $(SFNT2WOFF) $$FONTFILE; \
	      rm $$FONTFILE;  \
	    done; \
	    cd ..; \
	  done;

css:
	@ echo "Adding @font-face rules in mathml.css..."

	@ # add a marker in mathml.css
	@ $(SED) "/END LICENSE BLOCK/a\\\
$(SECTION_END_MARKER)" $(MATHML_CSS) > $(MATHML_FONTS)/$(RESOURCE)/$(MATHML_CSS)

	@ # first enumerate all the font files in 
	@ cat /dev/null > $(FONT_FILE_LIST)
	@ cd $(MATHML_FONTS)/$(RESOURCE)/$(MATHML_FONTS); \
	  for FONTDIR in `ls`; do \
	    cd $$FONTDIR; \
	    for FONTFILE in `ls *.woff`; do \
	      echo $$FONTDIR/$$FONTFILE >> ../../../../$(FONT_FILE_LIST); \
	    done; \
	    cd ..; \
	  done;

	@ # now extract those that are None/Regular/Bold/Italic|BoldItalic
	@ $(EGREP) -v -e "Regular|Bold|Italic|BoldItalic" $(FONT_FILE_LIST) > $(FONT_FILE_LIST)-None
	@ for STYLE in Regular Bold Italic BoldItalic; do \
	    $(EGREP) -e "-$$STYLE\.woff" $(FONT_FILE_LIST) > $(FONT_FILE_LIST)-$$STYLE; \
	  done;

	@ # Finally write font-face rules
	@ writeFontFaceRule() { \
	    $(SED) -i "/$(SECTION_END_MARKER)/i\\\
@font-face { font-family: '$$1'; \
src: local('$$2'), url('$(RESOURCE_CHROME_URI)/$$3'); \
font-weight: $$4; font-style: $$5; }" $(MATHML_CSS); \
	  }; \
	  cd $(MATHML_FONTS)/$(RESOURCE)/; \
          for FONTFILE in `cat ../../$(FONT_FILE_LIST)-None`; do \
	    LOCALNAME=`echo $$FONTFILE | $(SED) -n "s|.*/\(.*\)\.woff|\1|p "` ; \
	    writeFontFaceRule $$LOCALNAME $$LOCALNAME $$FONTFILE "normal" "normal"; \
	  done; \
          for FONTFILE in `cat ../../$(FONT_FILE_LIST)-Regular`; do \
	    LOCALNAME=`echo $$FONTFILE | $(SED) -n "s|.*/\(.*\)\.woff|\1|p "` ; \
	    FONTFAMILY=`echo $$FONTFILE | $(SED) -n "s|.*/\(.*\)\-Regular\.woff|\1|p "` ; \
	    writeFontFaceRule $$LOCALNAME $$FONTFAMILY $$FONTFILE "normal" "normal"; \
	  done; \
          for FONTFILE in `cat ../../$(FONT_FILE_LIST)-Bold`; do \
	    LOCALNAME=`echo $$FONTFILE | $(SED) -n "s|.*/\(.*\)\.woff|\1|p "` ; \
	    FONTFAMILY=`echo $$FONTFILE | $(SED) -n "s|.*/\(.*\)\-Bold\.woff|\1|p "` ; \
	    writeFontFaceRule $$FONTFAMILY $$LOCALNAME $$FONTFILE "bold" "normal"; \
	  done; \
          for FONTFILE in `cat ../../$(FONT_FILE_LIST)-Italic`; do \
	    LOCALNAME=`echo $$FONTFILE | $(SED) -n "s|.*/\(.*\)\.woff|\1|p "` ; \
	    FONTFAMILY=`echo $$FONTFILE | $(SED) -n "s|.*/\(.*\)\-Italic\.woff|\1|p "` ; \
	    writeFontFaceRule $$FONTFAMILY $$LOCALNAME $$FONTFILE "normal" "italic"; \
	  done; \
          for FONTFILE in `cat ../../$(FONT_FILE_LIST)-BoldItalic`; do \
	    LOCALNAME=`echo $$FONTFILE | $(SED) -n "s|.*/\(.*\)\.woff|\1|p "` ; \
	    FONTFAMILY=`echo $$FONTFILE | $(SED) -n "s|.*/\(.*\)\-BoldItalic\.woff|\1|p "` ; \
	    writeFontFaceRule $$FONTFAMILY $$LOCALNAME $$FONTFILE "bold" "italic"; \
	  done; \
          $(SED) -i "/$(SECTION_END_MARKER)/d" $(MATHML_CSS)

xpi:
	@ cd $(MATHML_FONTS) ; $(ZIP) -r ../$(MATHML_FONTS_XPI) *
