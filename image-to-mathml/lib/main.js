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
  TeXZilla = require("./TeXZilla"),
  { indexedDB } = require('sdk/indexed-db'),
  { predefinedRules } = require("./predefinedRules");

function TeXZillaFromLaTeX(aWorker, aLaTeX)
{
  var json = { input: aLaTeX };
  try {
    json.output = TeXZilla.toMathMLString(aLaTeX, false, false, true);
    aWorker.port.emit("fromLaTeX-response", json);
    return true;
  } catch (e) { }
  return false;
}

function addWorker(aWorker)
{
  aWorker.port.on("fromLaTeX-request", function(aLaTeX) {
    // Conversion strategies
    // T = TeXZilla
    // L = LaTeXML
    // TL = TeXZilla, LaTeXML
    // LT = LaTeXML, TeXZilla
    var s = prefs["strategy"];
    if (s === "T" || s === "TL") {
      // We try to convert the LaTeX source with our local copy of TeXZilla.
      if (TeXZillaFromLaTeX(aWorker, aLaTeX)) {
        return;
      }
    }
    if (s === "L" || s === "TL" || s === "LT") {
      // Now we try to convert the LaTeX source with a remote LaTeX instance.
      LaTeXML.fromLaTeX(aWorker, aLaTeX, function(aJSON) {
        if (!aJSON.output && prefs["strategy"] === "LT") {
          // If the LaTeXML conversion failed, we try TeXZilla.
          if (TeXZillaFromLaTeX(aWorker, aLaTeX)) {
            return;
          }
        }
        aWorker.port.emit("fromLaTeX-response", aJSON);
      });
    }
  });
}

// Initialize a database to store the page mod.
var database = {};
database.onerror = function(e) {
  console.error(e.value);
}
database.putPageMod = function(aURIPattern, aScript, aScriptOptions) {
  var store = database.db.
    transaction(["PageMod"], "readwrite").objectStore("PageMod");
  var request = store.put({
    URIPattern: aURIPattern,
    Script: aScript,
    ScriptOptions: aScriptOptions
  });
  request.onerror = database.onerror;
};
var databaseVersion = 1;
var request = indexedDB.open("PageModHandler", databaseVersion);
request.onerror = database.onerror;
request.onupgradeneeded = function(e) {
  var db = e.target.result;
  e.target.transaction.onerror = database.onerror;
  if(db.objectStoreNames.contains("PageMod")) {
    db.deleteObjectStore("PageMod");
  }

  // Initialize the database with a set of predefined rules.
  var store = db.createObjectStore("PageMod", { keyPath: "URIPattern"});
  store.createIndex("byConversionMethod",
                    ["Script", "ScriptOptions"], { unique: false });
  store.transaction.oncomplete = function(e) {
    var request, objectStore =
      db.transaction("PageMod", "readwrite").objectStore("PageMod");
    var i, j, patternList, script, scriptoptions;
    for (i = 0; i < predefinedRules.length; i++) {
      // Get the list of URI pattern. We handle the special singleton case.
      patternList = predefinedRules[i].URIPatternList;
      if (typeof patternList === "string") {
        patternList = [patternList];
      }
      // It seems that script option must be a string or this item won't
      // be listed in index.openCursor().
      scriptoptions = predefinedRules[i].ScriptOptions || "";
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
          selfData.url(pageModKey.Script)
        ],
        contentScriptOptions: pageModKey.ScriptOptions,
        onAttach: addWorker
      });
    }

    if (cursor) {
      pageModInclude = [cursor.value.URIPattern];
      pageModKey.Script = cursor.value.Script;
      pageModKey.ScriptOptions = cursor.value.ScriptOptions;
      cursor.continue();
    }
  };
}
