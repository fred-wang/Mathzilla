/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

var scripts, selectedScript;

function urlPatternChanged()
{
  var pattern = document.getElementById("urlPattern");
  document.getElementById("OKButton").disabled = (pattern.value === "");
}

function selectedScriptChanged()
{
  var i, s, options, o;

  // Get the selected script
  i = document.getElementById("scriptSelect").selectedIndex;
  for (s in scripts) {
    if (i == 0) {
      break;
    }
    i--;
  }
  selectedScript = s;
  s = scripts[selectedScript];
  document.getElementById("infoScript").textContent = s.description;

  // Set the options
  var refOption = document.getElementById("refOption");
  while (refOption.nextElementSibling) {
    refOption.parentNode.removeChild(refOption.nextElementSibling);
  }
  for (o in s.ScriptOptions) {
    var option = s.ScriptOptions[o];
    var newOption = refOption.cloneNode(true);
    newOption.removeAttribute("id");
    var label = newOption.getElementsByTagName("label")[0];
    label.setAttribute("for", o);
    label.textContent = option.title;
    newOption.getElementsByClassName("infoOption")[0].textContent =
      option.description;
    var input = newOption.getElementsByTagName("input")[0]; 
    input.setAttribute("id", o);
    if (option.type === "bool") {
      input.type = "checkbox";
      input.checked = option.value;
    } else if (option.type === "string") {
      input.type = "text";
      input.value = option.value;
    } else {
      throw "Unknown option type: " + option.type;
    }
    refOption.parentNode.appendChild(newOption);
  }
}

function submitRule()
{
  var s = scripts[selectedScript];
  var json = {
    URLPattern: document.getElementById("urlPattern").value,
    Script: selectedScript,
    ScriptOptions: {}
  };
  for (var o in s.ScriptOptions) {
    var input = document.getElementById(o);
    var option = s.ScriptOptions[o];
    if (option.type === "bool") {
      json.ScriptOptions[o] = input.checked;
    } else if (option.type === "string") {
      json.ScriptOptions[o] = input.value;
    } else {
      throw "Unknown option type: " + option.type;
    }
  }
  self.port.emit("update-rule", json);
}

self.port.on("send-data", function (aData) {
  scripts = aData.scripts;

  var local = aData.local, s, i, selectElement, selectChild;

  // Set the document direction.
  document.body.setAttribute("dir", aData.dir);
  
  // Localize the labels.
  for (s in local) {
    var elements = document.getElementsByClassName(s);
    for (i = 0; i < elements.length; i++) {
      elements[i].textContent = local[s];
    }
  }
  
  // Set the default URL pattern.
  var urlPattern = document.getElementById("urlPattern");
  urlPattern.value = aData.urlPattern;
  urlPattern.addEventListener("change", urlPatternChanged);
  urlPatternChanged();

  // Set the predefined script list.
  selectElement = document.getElementById("scriptSelect");
  selectChild = selectElement.firstElementChild;
  for (s in scripts) {
    if (!selectChild) {
      selectChild = document.createElement("option");
      selectElement.appendChild(selectChild);
    }
    selectChild.textContent = scripts[s].title;
    selectChild = selectChild.nextElementSibling;
  }
  selectElement.addEventListener("change", selectedScriptChanged);
  selectedScriptChanged();
  
  // Event for the cancel and OK button.
  document.getElementById("CancelButton").addEventListener("click",
    function () { self.port.emit("cancel"); }
  );
  document.getElementById("OKButton").addEventListener("click", submitRule);
});
