/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla MathML Project.
 *
 * The Initial Developer of the Original Code is
 * Frederic Wang <fred.wang@free.fr>.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var self                  = require("self");
var contextMenu           = require("context-menu");
var tabBrowser            = require("tab-browser");
var pageMod               = require("page-mod");
var copyMathML            = require("copy-mathml");
var imageToMathml         = require("image-to-mathml");
var contentToPresentation = require("content-to-presentation");

contentToPresentation.loadXSL();

// Add several context menus

contextMenu.add(contextMenu.Item({
  label: "Copy MathML Formula",
  context: "math",
  onClick: function (contextObj, item) {
    copyMathML.copy(contextObj.node);
  }
}));

contextMenu.add(contextMenu.Item({
  label: "Open Mathzilla Parser",  
  onClick: function (contextObj, item) {
    tabBrowser.addTab(self.data.url("mathzilla-parser.xhtml"));
  }
}));

var transformAllImagesOn = false;
contextMenu.add(contextMenu.Item({
  label: "Transform all images into MathML",
  onClick: function (contextObj, item) {

    transformContentMathMLOn = false;
    transformAllImagesOn = true;
    onPageLoad(contextObj.document);

    // if (transformAllImagesOn) {
    //   transformAllImagesOn = false;
    // } else {
    //   transformAllImagesOn = true;
    //   onPageLoad(contextObj.document);
    // }
  }
}));

contextMenu.add(contextMenu.Item({
  label: "Transform image into MathML",
  context: "img",
  onClick: function (contextObj, item) {
    imageToMathml.transform(contextObj.document,
                            contextObj.node, true);
  }
}));

var transformContentMathMLOn = false;
contextMenu.add(contextMenu.Item({
  label: "Transform content MathML into presentation MathML",
  onClick: function (contextObj, item) {

    transformContentMathMLOn = true;
    transformAllImagesOn = false;
    onPageLoad(contextObj.document);

    // if (transformContentMathMLOn) {
    //   transformContentMathMLOn = false;
    // } else {
    //   transformContentMathMLOn = true;
    //   onPageLoad(contextObj.document);
    // }
  }
}));

// Operations executed after each page load

// XXXfred This does not work...
// pageMod.add(new pageMod.PageMod({
//   include: ["*"],
//   contentScriptWhen: 'ready',
//   contentScript: 'onPageLoad(document);'
// }));

function onPageLoad(aDocument)
{
  if (transformContentMathMLOn) {
    var maths = aDocument.getElementsByTagName("math");
    for (var i = 0; i < maths.length; i++) {
      contentToPresentation.convert(aDocument, maths[i]);
    }
  }

  if (transformAllImagesOn) {
    var images = aDocument.getElementsByTagName("img");
    for (var i = 0; i < images.length; ) {
      if (!imageToMathml.transform(aDocument, images[i], false)) {
        // increment only if the transformation failed, for otherwise the
        // img has been replaced by a math and hence i is already pointing to
        // the next image!
        i++;
      }
    }
  }
}
