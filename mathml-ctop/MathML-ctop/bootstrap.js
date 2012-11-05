/* -*- Mode: Javascript; tab-width: 2; indent-tabs-mode:nil; -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

const kCtopModule = "chrome://MathML-ctop/content/ctop.jsm";

var gXSLTProcessor = null;

function convertContentMathMLToPresentationMathML(aDocument)
{
    // Search all <math>'s on the page, but do nothing if none are found.
    var mathElements = aDocument.
        getElementsByTagNameNS("http://www.w3.org/1998/Math/MathML", "math");
    if (mathElements.length == 0) return;

    // If the XSLT processor is not loaded yet, do it now
    if (!gXSLTProcessor) {
        Cu.import(kCtopModule);
        gXSLTProcessor =
            Cc["@mozilla.org/document-transformer;1?type=xslt"].
            createInstance(Ci.nsIXSLTProcessor);
        gXSLTProcessor.importStylesheet(CtopXSLT);
    }

    // Now apply the XSLT stylesheet to each <math> element
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
    var doc = aEvent.originalTarget;
    convertContentMathMLToPresentationMathML(doc);
}

////////////////////////////////////////////////////////////////////////////////
// Implement a basic Web progress listener to track page loadings
////////////////////////////////////////////////////////////////////////////////
const STATE_START = Ci.nsIWebProgressListener.STATE_START;
const STATE_STOP = Ci.nsIWebProgressListener.STATE_STOP;

var gWebProgressListener = {
    QueryInterface: function(aIID) {
        if (aIID.equals(Ci.nsIWebProgressListener) ||
            aIID.equals(Ci.nsISupportsWeakReference) ||
            aIID.equals(Ci.nsISupports))
            return this;
        throw Cr.NS_NOINTERFACE;
    },
    onStateChange: function(aBrowser, aWebProgress, aRequest,
                            aFlag, aStatus) {
        if(aFlag & STATE_START) {
            aBrowser.addEventListener("DOMContentLoaded",
                                      onDOMContentLoaded, false);

        }
        if(aFlag & STATE_STOP) {
            aBrowser.removeEventListener("DOMContentLoaded",
                                         onDOMContentLoaded, false);
        }
    },
    onLocationChange: function(aBrowser, aProgress, aRequest, aURI) { },
    onProgressChange: function(aBrowser, aWebProgress, aRequest,
                               curSelf, maxSelf, curTot, maxTot) { },
    onStatusChange: function(aBrowser, aWebProgress, aRequest,
                             aStatus, aMessage) { },
    onSecurityChange: function(aBrowser, aWebProgress, aRequest, aState) { }
};

////////////////////////////////////////////////////////////////////////////////
// Implement bootstrap main functions and a basic observer for browser windows.
// The code is based on
// developer.mozilla.org/en-US/docs/Extensions/Mobile/Addons_developer_guide
////////////////////////////////////////////////////////////////////////////////

function loadIntoWindow(aWindow) {
    if (aWindow) {
        var tabbrowser = aWindow.document.getElementById("content");
        if (tabbrowser && tabbrowser.tagName == "tabbrowser") {
            tabbrowser.addTabsProgressListener(gWebProgressListener);
        }
    }
}

function unloadFromWindow(aWindow) {
    if (aWindow) {
        var tabbrowser = aWindow.document.getElementById("content");
        if (tabbrowser && tabbrowser.tagName == "tabbrowser") {
            tabbrowser.removeTabsProgressListener(gWebProgressListener);
        }
    }
}

var windowListener = {
    onOpenWindow: function(aWindow) {
        // Wait for the window to finish loading
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
    
    // Load into any existing windows
    let windows = wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements()) {
        let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
        loadIntoWindow(domWindow);
    }
    
    // Load into any new windows
    wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
    // When the application is shutting down we normally don't have to clean
    // up any UI changes made
    if (aReason == APP_SHUTDOWN)
        return;
    
    let wm = Cc["@mozilla.org/appshell/window-mediator;1"].
        getService(Ci.nsIWindowMediator);
    
    // Stop listening for new windows
    wm.removeListener(windowListener);
    
    // Unload from any existing windows
    let windows = wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements()) {
        let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
        unloadFromWindow(domWindow);
    }

    // Unload ctop.jsm
    if (gXSLTProcessor) {
        Cu.unload(kCtopModule);
        gXSLTProcessor = null;
    }
}

function install(aData, aReason) {}
function uninstall(aData, aReason) {}