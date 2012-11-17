/* -*- Mode: Javascript; tab-width: 2; indent-tabs-mode:nil; -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

// URI of the style sheet
const kXSLTStyleSheet = "chrome://MathML-ctop/content/stylesheet.xsl";

// Define XMLHttpRequest. This only works correctly with Gecko >= 16. See
// developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest/Using_XMLHttpRequest
const XMLHttpRequest =
    Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1");

// Global variable to store the XSLT processor. It is created only once, the
// first time we need it, and kept at least until the add-on is disabled.
var gXSLTProcessor = null;

function initXSLTProcessor(aDocument)
{
    // Start a XHR request to load the XSLT style sheet.
    var xhr = XMLHttpRequest();
    xhr.open("GET", kXSLTStyleSheet, true);
    xhr.onload = function (aEvent) {
        // Create the XSLT processor and initialize it with the style sheet.
        gXSLTProcessor =
            Cc["@mozilla.org/document-transformer;1?type=xslt"].
            createInstance(Ci.nsIXSLTProcessor);
        gXSLTProcessor.importStylesheet(xhr.response);
        // We are done, let's try to apply the XSLT style sheet again.
        applyXSLTStyleSheetToMathML(aDocument);
    };
    xhr.responseType = "document";
    xhr.send(null);
}

function applyXSLTStyleSheetToMathML(aDocument)
{
    // Search all <math>'s on the page, but do nothing if none are found.
    var mathElements = aDocument.
        getElementsByTagNameNS("http://www.w3.org/1998/Math/MathML", "math");
    if (mathElements.length == 0) return;

    // If the XSLT processor is not loaded yet, do it now.
    if (!gXSLTProcessor) {
        initXSLTProcessor(aDocument);
        return;
    }

    // Now apply the XSLT style sheet to each <math> element.
    for (var i = 0; i < mathElements.length; i++) {
        var newMath =
            gXSLTProcessor.transformToFragment(mathElements[i], aDocument);
        if (newMath != null) {
            mathElements[i].parentNode.replaceChild(newMath, mathElements[i]); 
        }
    }
}

function onDOMContentLoaded(aEvent)
{
    // DOMContentLoaded: let's try to apply the XSLT style sheet
    var doc = aEvent.originalTarget;
    applyXSLTStyleSheetToMathML(doc);
}

////////////////////////////////////////////////////////////////////////////////
// Implement bootstrap main functions and a basic observer for browser windows.
// The code is based on
// developer.mozilla.org/en-US/docs/Extensions/Mobile/Addons_developer_guide
////////////////////////////////////////////////////////////////////////////////

function loadIntoWindow(aWindow) {
    if (aWindow) {
        // Add a listener to the tabbrowser
        aWindow.gBrowser.addEventListener("DOMContentLoaded",
                                          onDOMContentLoaded, false);
    }
}

function unloadFromWindow(aWindow) {
    if (aWindow) {
        // Remove the listener from the tabbrowser
        aWindow.gBrowser.removeEventListener("DOMContentLoaded",
                                             onDOMContentLoaded, false);
    }
}

var windowListener = {
    onOpenWindow: function(aWindow) {
        // Wait for the window to finish loading.
        let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).
            getInterface(Ci.nsIDOMWindow);
        domWindow.addEventListener("load", function() {
            domWindow.removeEventListener("load", arguments.callee, false);
            loadIntoWindow(domWindow);
        }, false);
    },
    
    onCloseWindow: function(aWindow) {},
    onWindowTitleChange: function(aWindow, aTitle) {}
};

function startup(aData, aReason) {
    let wm = Cc["@mozilla.org/appshell/window-mediator;1"].
        getService(Ci.nsIWindowMediator);
    
    // Load into any existing windows.
    let windows = wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements()) {
        let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
        loadIntoWindow(domWindow);
    }
    
    // Load into any new windows.
    wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
    // When the application is shutting down we normally don't have to clean
    // up anything.
    if (aReason == APP_SHUTDOWN)
        return;
    
    // Reset the gXSLTProcessor variable.
    gXSLTProcessor = null;

    let wm = Cc["@mozilla.org/appshell/window-mediator;1"].
        getService(Ci.nsIWindowMediator);
    
    // Stop listening for new windows.
    wm.removeListener(windowListener);
    
    // Unload from any existing windows.
    let windows = wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements()) {
        let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
        unloadFromWindow(domWindow);
    }
}

function install(aData, aReason) {}
function uninstall(aData, aReason) {}
