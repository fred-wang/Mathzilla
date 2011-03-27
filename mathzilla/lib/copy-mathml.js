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

exports.copy = function(aNode) {

  // Serialize the node into a "<math> ... </math>" string.
  //  var serializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"].
  //    createInstance(Components.interfaces.nsIDOMSerializer);
  var mathmlCode = serializer.serializeToString(aNode);
  var mathmlCodeLength = 2 * mathmlCode.length;
  //var mathmlCodeContainer =
  //    Components.classes["@mozilla.org/supports-string;1"].
  //    createInstance(Components.interfaces.nsISupportsString);
  mathmlCodeContainer.data = mathmlCode;

  // Create a copy of the previous string with an XML prolog.
  var mathmlDoc = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + mathmlCode; 
  var mathmlDocLength = 2 * mathmlDoc.length;
  //  var mathmlDocContainer = Components.classes["@mozilla.org/supports-string;1"].
  //    createInstance(Components.interfaces.nsISupportsString);
  mathmlDocContainer.data = mathmlDoc;

  // Create a transferable object with Unicode text and MathML versions.
  //  var transferable = Components.classes["@mozilla.org/widget/transferable;1"].
  //    createInstance(Components.interfaces.nsITransferable);
  transferable.addDataFlavor("text/unicode");
  transferable.setTransferData("text/unicode",
                               mathmlCodeContainer, mathmlCodeLength);
      // XXXfred not sure if it is the correct flavor name to use. The W3C Rec
      // provides other names for Windows and MacOS...
      // See http://www.w3.org/TR/MathML3/chapter6.html#encoding-names
  transferable.addDataFlavor("application/mathml+xml");
  transferable.setTransferData("application/mathml+xml",
                               mathmlDocContainer, mathmlDocLength);

  // Finally, copy the data into the clipboard 
  //  var clipboard = Components.classes["@mozilla.org/widget/clipboard;1"].
  //    getService(Components.interfaces.nsIClipboard);
  //  clipboard.setData(transferable, null,
  //                    Components.interfaces.nsIClipboard.kGlobalClipboard);
}
