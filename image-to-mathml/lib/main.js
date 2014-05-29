/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

var selfData = require("sdk/self").data,
  pageMod = require("sdk/page-mod"),
  simplePrefs = require('sdk/simple-prefs'),
  prefs = simplePrefs.prefs,
  LaTeXML = require("./LaTeXML"),
  { indexedDB } = require('sdk/indexed-db'),
  { predefinedRules, predefinedScripts,
    localizePredefinedScripts } = require("./predefinedRules"),
  _ = require("sdk/l10n").get;

var database = { version: 1 };

function onAttach(aWorker)
{
  // LaTeX-to-MathML conversion.
  aWorker.port.on("fromLaTeX-request", function(aLaTeX) {
    LaTeXML.fromLaTeX(database, aWorker, aLaTeX,
                      function(aJSON) {
      aWorker.port.emit("fromLaTeX-response", aJSON);
    });
  });

  // Mathematica-to-MathML conversion.
  aWorker.port.on("fromMathematica-request", function(aMathematica) {
    Mathematical.fromMathematica(database, aWorker, aMathematica,
                                 function(aJSON) {
      aWorker.port.emit("fromMathematica-response", aJSON);
    });
  });

  // Ask the worker script to convert all images into MathML.
  aWorker.port.emit("convert-images");
}

// Initialize a database to store the page mod and cache the MathML output.
database.onerror = function(e) {
  console.error(e.value);
}
var request = indexedDB.open("ImageToMathML", database.version);
request.onerror = database.onerror;
request.onupgradeneeded = function(e) {
  var db, store;
  db = e.target.result;
  e.target.transaction.onerror = database.onerror;

  // Initialize the database with a set of predefined rules.
  if(db.objectStoreNames.contains("PageMod")) {
    db.deleteObjectStore("PageMod");
  }
  store = db.createObjectStore("PageMod", { keyPath: "URIPattern" });
  store.createIndex("byConversionMethod",
                    ["Script", "ScriptOptions"], { unique: false });
  store.transaction.oncomplete = function(e) {
    var request, objectStore, i, j, patternList, script, scriptoptions;
    objectStore = db.transaction("PageMod", "readwrite").objectStore("PageMod");
    for (i = 0; i < predefinedRules.length; i++) {
      // It seems that script option must be a string or this item won't
      // be listed in index.openCursor(). It will be stringified to be passed
      // to the worker scripts anyway.
      scriptoptions = JSON.stringify(predefinedRules[i].ScriptOptions);
      patternList = predefinedRules[i].URIPatternList;
      for (j = 0; j < patternList.length; j++) {
        request = objectStore.add({
          URIPattern: patternList[j],
          Script: predefinedRules[i].Script,
          ScriptOptions: scriptoptions
        });
        request.onerror = database.onerror;
      }
    }
  }

  // Create empty stores to cache the MathML output.
  if(db.objectStoreNames.contains("LaTeXML")) {
    db.deleteObjectStore("LaTeXML");
  }
  db.createObjectStore("LaTeXML");
  if(db.objectStoreNames.contains("Mathematica")) {
    db.deleteObjectStore("Mathematica");
  }
  db.createObjectStore("Mathematica");
}
request.onsuccess = function(e) {
  database.db = e.target.result;

  // Read all the entries from the database and create the
  // corresponding Page Mod.
  var store = database.db.transaction("PageMod").objectStore("PageMod");
  var index = store.index("byConversionMethod");
  var pageModInclude = [], pageModKey = {};
  index.openCursor().onsuccess = function(e) {
    var cursor = e.target.result;
    if (cursor) {
      if (pageModKey.Script === cursor.value.Script &&
          pageModKey.ScriptOptions === cursor.value.ScriptOptions) {
        pageModInclude.push(cursor.value.URIPattern);
        cursor.continue();
        return;
      }
    }

    if (pageModInclude.length > 0) {
      pageMod.PageMod({
        include: pageModInclude,
        contentScriptFile: [
          selfData.url("convert.js"),
          selfData.url(pageModKey.Script + ".js")
        ],
        contentScriptOptions: pageModKey.ScriptOptions,
        onAttach: onAttach
      });
    }

    if (cursor) {
      pageModInclude = [cursor.value.URIPattern];
      pageModKey.Script = cursor.value.Script;
      pageModKey.ScriptOptions = cursor.value.ScriptOptions;
      cursor.continue();
    }
  };
};

// Update a PageMod.
database.putPageMod = function(aURIPattern, aScript, aScriptOptions) {
  var store = database.db.
    transaction(["PageMod"], "readwrite").objectStore("PageMod");
  var request = store.put({
    URIPattern: aURIPattern,
    Script: aScript,
    ScriptOptions: JSON.stringify(aScriptOptions)
  });
  request.onerror = database.onerror;
};

// Clear the MathML cache
database.clearMathMLCache = function(aStore) {
  if (this.db) {
    this.db.transaction([aStore], "readwrite").objectStore(aStore).clear();
  }
}
simplePrefs.on("LaTeXMLCache", function() {
  if (!prefs["LaTeXMLCache"]) {
    database.clearMathMLCache("LaTeXML");
  }
});

// Update the MathML cache
database.putMathML = function(aStore, aSource, aMathML) {
  if (this.db) {
    var store = this.db.
      transaction([aStore], "readwrite").objectStore(aStore);
    var request = store.put(aMathML, aSource);
    request.onerror = this.onerror;
  }
};

// Try and get the MathML cache
database.getMathML = function(aStore, aSource, aCallback) {
  if (!this.db) {
    aCallback(null);
  }
  var store = this.db.
    transaction([aStore], "readwrite").objectStore(aStore);
  var request = store.get(aSource);
  request.onerror = function() {
    database.onerror();
    aCallback(null);
  };
  request.onsuccess = function() {
    aCallback(request.result);
  };
};

////////////////////////////////////////////////////////////////////////////////
var addRulePanelLocal = {
  addRule: null,
  deleteRule: null,
  uriPatternLabel: null,
  scriptLabel: null,
  Cancel: null,
  OK: null,
}
function addRulePanelLocalize() {
  for (var key in addRulePanelLocal) {
    addRulePanelLocal[key] = _("addRulePanel_" + key);
  }
}

var addRulePanel = require("sdk/panel").Panel({
  contentURL: selfData.url("addRulePanel.html"),
  contentScriptFile: selfData.url("addRulePanel.js"),
});

require("sdk/ui/button/action").ActionButton({
  id: "show-panel",
  label: "Show Panel",
  icon: {
    "16": "./icon16.png",
    "32": "./icon32.png",
    "64": "./icon64.png"
  },
  onClick: function(aState) {
    localizePredefinedScripts();
    addRulePanelLocalize();
    addRulePanel.port.emit("send-data", {
      dir: _("addRulePanel_dir"),
      local: addRulePanelLocal,
      scripts: predefinedScripts
    });
    addRulePanel.show({
      width: 400,
      height: 400,
    });
  }
});

addRulePanel.port.on("cancel", function() {
    addRulePanel.hide();
});
