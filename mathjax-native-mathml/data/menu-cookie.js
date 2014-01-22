/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Create a mjx.menu cookie for this document and indicate that the NativeMML
   output mode is selected. */
var cookie = "mjx.menu=" + escape("renderer:NativeMML");
document.cookie = cookie + "; path=/";

/* Delete the cookie once the page is loaded. We do not want to keep a cookie
   for each domain visited and most pages using MathJax will already have
   read it during MathJax's startup sequence. */
var listener = function() {
  document.cookie = "mjx.menu=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  window.removeEventListener("load", listener, false);
}
window.addEventListener("load", listener, false);
