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
  document.getElementById("DeleteButton").disabled = true;
  if (pattern.value !== "") {
    self.port.emit("get-rule-data", pattern.value);
  }
}

function selectedScriptChanged(aData)
{
  console.log("xxxxx"+aData);
  var i, s, options, o;

  // Get the selected script
  if (aData) {
    i = 0;
    for (s in scripts) {
      if (s === aData.Script) {
        break;
      }
      i++;
    }
    document.getElementById("scriptSelect").selectedIndex = i;
  } else {
    i = document.getElementById("scriptSelect").selectedIndex;
    for (s in scripts) {
      if (i == 0) {
        break;
      }
      i--;
    }
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
    var value = option.value;
    if (aData) {
      value = aData.ScriptOptions[o];
    }
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
      input.checked = value;
    } else if (option.type === "string") {
      input.type = "text";
      input.value = value;
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

self.port.on("send-main-data", function (aData) {
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
  selectElement.addEventListener("change", function () {
    selectedScriptChanged(null);
  });
  selectedScriptChanged(null);
  
  // Event for the cancel, OK and delete buttons.
  document.getElementById("CancelButton").addEventListener("click",
    function() { self.port.emit("cancel"); }
  );
  document.getElementById("OKButton").addEventListener("click", submitRule);
  document.getElementById("DeleteButton").addEventListener("click", 
    function() {
      self.port.emit("delete-rule",
                     document.getElementById("urlPattern").value);
    }
  );
});

self.port.on("send-rule-data", function (aData) {
  var pattern = document.getElementById("urlPattern").value;
  if (aData.URLPattern !== pattern || !aData.Script) {
    return;
  }
  aData.ScriptOptions = JSON.parse(aData.ScriptOptions);

  // The rule data has been found, enable the button.
  document.getElementById("DeleteButton").disabled = false;

  // Select the script
  selectedScriptChanged(aData)
});
