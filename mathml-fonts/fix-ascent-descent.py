# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import fontforge

latinmodern = "MathML-fonts/resource/LatinModern/latinmodern-math-AscentDescent.woff"
font = fontforge.open(latinmodern)
font.familyname = "Latin Modern Math Ascent Descent"
font.fontname = "LatinModernMathAscentDescent-Regular"
font.fullname = font.fontname
font.os2_typoascent_add = 0
font.os2_typodescent_add = 0
font.hhea_ascent = font.os2_typoascent
font.hhea_descent = font.os2_typodescent
font.os2_winascent = font.os2_typoascent
font.os2_windescent = -font.os2_typodescent
font.hhea_ascent_add = 0
font.hhea_descent_add = 0
font.os2_winascent_add = 0
font.os2_windescent_add = 0
font.generate(latinmodern)
