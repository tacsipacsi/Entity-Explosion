//importScripts('jquery-3.6.0.min.js')

var isoLanguage
var savedIsoLanguage
var tabURL
var language_translations

const ltre = "\u{2066}"
const rtle = "\u{2067}"
const pdf = "\u{2069}"

//languages_right_to_left.txt in supplementary folder, broadly from https://w.wiki/9kv6 with two extras from https://w.wiki/9kuv
const rtl_language_codes = ["acm","aeb-arab","ar","arc","arq","ary","arz","azb","bjn","bqi","ckb","dv","ett","fa","fa-af","glk","hbo","he","hno","khw","kk-arab","kmz","ks","ks-arab","ku-arab","ky-arab","lrc","luz","ms-arab","mzn","nqo","ota","otk","pnb","ps","sdh","syc","ug","uzs","xpu","yi"]

// a set of examples from https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage
function handleResponse(message) {
  //console.log(`Message from the background script:  ${message.response}`);
}
function handleError(error) {
  console.log(`Error: ${error}`);
}
function requestLanguages() {
  var sending = chrome.runtime.sendMessage({
    greeting: "Please send the language translations. Love from item-properties.js",
    languageplease: true
  });
}
function sendIsoLanguage() {
  var sending = chrome.runtime.sendMessage({
    greeting: "please save this language: " + isoLanguage, //2024-04-14 was savedIsoLanguage in this line and below?
    isoLanguage: isoLanguage,
    saveisoplease: true
  });
  savedIsoLanguage = isoLanguage;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (typeof request.iso !== 'undefined') {
    savedIsoLanguage = request.iso
    isoLanguage = request.iso

    if (typeof request.jsonLanguages !== 'undefined') {
      try {
        language_translations = JSON.parse(request.jsonLanguages); // this is how you parse a string into JSON 
      } catch (ex) {
        console.log("failure parsing language translations")
        handleError(ex);
      }

      initiateRedraw(isoLanguage);
    }
  }
  //return Promise.resolve("Dummy response to keep the console quiet"); //https://github.com/mozilla/webextension-polyfill/issues/130

  //https://stackoverflow.com/questions/55224629/what-caused-the-unchecked-runtime-lasterror-the-message-port-closed-before-a-r
  Promise.resolve("").then(result => sendResponse(result));
  return true;

})

function selectElement(id, valueToSelect) {
  var element = document.getElementById(id);
  element.value = valueToSelect;
}

// Function to find the language name by its code, given a list of language_translations
//function getLanguageName(language_translations, code) {
//  var language = language_translations.find(lang => lang.lang === code);
//  return language ? language.tongue : code;
//}
function getLanguageName(language_translations, code) {
  for (var i = 0; i < Object.keys(language_translations).length; i++) {
    if (language_translations[i].lang === code) {
      return language_translations[i].tongue;
    }
  }
  return code; // Return the two letter code if the name is not found
}

function getStringBeforeHyphen(inputString) {
    const index = inputString.indexOf("-");
    if (index !== -1) {
        return inputString.substring(0, index);
    }
    // If no hyphen is found, return the entire input string.
    return inputString;
}


function update_languagebox(language_translations) {
  var selection = document.getElementById("box0");
	
  // use Hebrew as a test for how right-to-left languages should display the languages in the dropdown
  if (rtl_language_codes.includes(isoLanguage)) {
	//this does it once and for all for the whole list, see below for an item by item alignment
    //document.getElementById("box0").style.textAlign='right';
    //document.getElementById("box1").style.textAlign='right';
  }  
	
	
  while (selection.firstChild) {
    selection.removeChild(selection.firstChild);
  }

  //add English at the start as a default
  //var o = document.createElement("option");
  //o.value = "en";
  //o.text = "[en] English";
	
  //add i18n language (with variant removed) at the start as a default
  var o = document.createElement("option");
  //var ui_locale = chrome.i18n.getMessage('@@ui_locale');
  var ui_locale = getStringBeforeHyphen(chrome.i18n.getUILanguage().toLowerCase());
  if (ui_locale != chrome.i18n.getUILanguage().toLowerCase()) {
	// only add this variant-reduced version to the list if it actually is a variant
	o.value = ui_locale;
    o.text = '[' + ui_locale + '] ' + getLanguageName(language_translations, ui_locale);
    if (rtl_language_codes.includes(isoLanguage)) {
		o.style.textAlign='right';
		o.text = getLanguageName(language_translations, ui_locale)+' ['+ui_locale+']';
	}  
  	selection.appendChild(o);
  }
	
  //add i18n language (with variant in place) next as a likely selection
  var o = document.createElement("option");
  var ui_locale = chrome.i18n.getUILanguage().toLowerCase();
  o.value = ui_locale;
  o.text = '[' + ui_locale + '] ' + getLanguageName(language_translations, ui_locale);
  if (rtl_language_codes.includes(isoLanguage)) {
		o.style.textAlign='right';
		o.text = getLanguageName(language_translations, ui_locale)+' ['+ui_locale+']';
  }  
  selection.appendChild(o);
	
  for (var i = 0; i < Object.keys(language_translations).length; i++) {
    o = document.createElement("option");
    o.value = language_translations[i].lang;
    o.text = '['+language_translations[i].lang+']     '+language_translations[i].tongue;

	// use Hebrew as a test for how right-to-left languages should display the languages in the dropdown
	if (rtl_language_codes.includes(isoLanguage)) {
		//this does it item by item, see above for once and for all for the whole list alignment
		o.style.textAlign='right';
		//this puts the code at the right
		o.text = language_translations[i].tongue+'    ['+language_translations[i].lang+']';
	}  

    selection.appendChild(o);

    if (o.value == isoLanguage) {
      selection.selectedIndex = i + 1;
    }
  }
}

function replaceAll(string, search, replace) {
  return string.split(search).join(replace);
}


// update this list with data from (old) https://w.wiki/XU5 (new) https://w.wiki/XUx
function redrawLabels(isoLanguage) {
  if (typeof language_translations == 'undefined') {
    requestLanguages()
  } else {
    for (var i = 0; i < Object.keys(language_translations).length; i++) {
      if (typeof language_translations[i].lang !== 'undefined') {
        if (language_translations[i].lang.localeCompare(isoLanguage) == 0) {
          // use Hebrew as a test for how right-to-left languages should display the languages in the dropdown
          for (const elem of document.getElementsByClassName('wd-translated')) {
            elem.lang = isoLanguage;
            elem.dir = rtl_language_codes.includes(isoLanguage) ? 'rtl' : 'ltr';
          }

          const boxLabel0 = document.getElementById('boxLabel0');
          const boxLabel1 = document.getElementById('boxLabel1');
          boxLabel0.textContent = language_translations[i].language;
          boxLabel1.textContent = language_translations[i].entity;
          // The language is now inherited from .wd-translated
          boxLabel0.lang = boxLabel1.lang = null;

          break
        }
      }
    }
  }
}

/**
 * Parse an HTML fragment into DOM nodes.
 * @param {string} html The HTML fragments
 * @returns The list of the DOM nodes parsed from the HTML.
 */
function parseHTML(html) {
  return new DOMParser().parseFromString(html, 'text/html').body.childNodes;
}

/**
 * Add a progress text to `#div_wdlink`, with proper language markup.
 * @param {string} message Name of the message containing the progress text HTML.
 * @param  {...string} parameters parameters to the message.
 */
function addProgressText(message, ...parameters) {
  const text = chrome.i18n.getMessage(message, parameters);
  const p = document.createElement('p');
  p.lang = chrome.i18n.getMessage('@@ui_locale');
  p.dir = chrome.i18n.getMessage('@@bidi_dir');
  p.append(...parseHTML(text));
  document.getElementById('div_wdlink').append(p);
}

/**
 * Try showing a link to the query while it's running (in case it gets stuck)
 * @param {1|2} queryNum
 * @param {string} encodedQuery
 */
function addInProgressText(queryNum, encodedQuery) {
  const link = document.createElement('a');
  link.target = '_blank';
  link.href = `https://query.wikidata.org/#${encodedQuery}`;
  link.textContent = chrome.i18n.getMessage(`query${queryNum}`);
  addProgressText('sentToWikidata', link.outerHTML);
}

function specific_website_QID_search(isoLanguage, tabURL) {
  var string = '';
  // create URI-encoded query string to get corresponding Wikidata items name and IRI, example: https://w.wiki/4udm
  // would work better if any trailing "/" was first removed from the tabURL   
  var tabURL_stripped = tabURL.replace(/\/$/, "");

  //console.log('direct URL test: '+tabURL_stripped);

  string = 
  	'SELECT ?iri ?iriLabel WHERE {'
  	+ 'BIND(URI("'+tabURL_stripped+'") AS ?uri)'
  	+ '?iri wdt:P2699|wdt:P856|wdt:P854|wdt:P1065|wdt:P1581|wdt:P973|wdt:P8214|wdt:P7014|wdt:P6378|wdt:P7101|wdt:P2888 ?uri .'
	+ "SERVICE wikibase:label { bd:serviceParam wikibase:language '" + isoLanguage + "' } ."
	+ '}'
	+ 'LIMIT 100'; //no sort for the moment - there should usually only be one result
	
  var encodedQuery = encodeURIComponent(string);

  addInProgressText(2, encodedQuery);


  fetch('https://query.wikidata.org/sparql?query=' + encodedQuery, {
	 //method: 'GET',
 	 headers: {
   		'Accept': 'application/json'//,
		//'Api-User-Agent': 'Entity-Explosion (https://www.wikidata.org/wiki/Wikidata:Entity_Explosion)'
 	}
  })
	.then(
		function (response) {
			//console.log(response);
			return response.json();
		}
	  )
	.then(
		function (data) {
			//console.log(data);

      if (data.results.bindings.length == 0) {
        chrome.action.setIcon({ path: "./images/EE-black-38.png" });
        no_result();
      } else {
        for (i = 0; i < data.results.bindings.length; i++) {
          // concatenate the Q number on the end of the label (Q extracted from iri after 31 other url characters)
          label = data.results.bindings[i].iriLabel.value + ' (' + data.results.bindings[i].iri.value.substring(31, data.results.bindings[i].iri.value.length) + ')'
          iri = data.results.bindings[i].iri.value
          // add the new information to the dropdown list
          $("#box1").append("<option value='" + iri + "'>" + label + '</option>');
        }
		  
        chrome.action.setIcon({ path: "./images/EE-emerald-38.png" });
        if (data.results.bindings.length == 1) {
          document.getElementById("box1").selectedIndex = "1"; //when only one item is returned, it's a match
          box1change();
        }
	  }
	}
	)
 	.catch(
		function (error) {
		console.error('Unable to get items.', error);
	}
  )
}

function general_QID_search(isoLanguage, tabURL) {
  var string = '';
  // create URI-encoded query string to get corresponding Wikidata items name and IRI, example: https://w.wiki/XZg https://w.wiki/3uQa
  
  //console.log('general QID search: '+tabURL);
  
  string = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>'
    + 'PREFIX wd: <http://www.wikidata.org/entity/>'
    + 'PREFIX wdt: <http://www.wikidata.org/prop/direct/>'
    + 'PREFIX wikibase: <http://wikiba.se/ontology#>'
    + 'SELECT DISTINCT ?iriLabel ?iri WHERE {'
    + 'hint:Query hint:optimizer "None".'
    + "VALUES ( ?test_url0 ) { ('" + tabURL + "') }"
    + '{?prop p:P1630/ps:P1630 ?formatter_url0 .}  UNION  {?prop p:P3303/ps:P3303 ?formatter_url0 .}'
    + 'BIND (REPLACE(?test_url0,"^https://","") AS ?test_url1)'
    + 'BIND (REPLACE(?test_url1,"^http://","") AS ?test_url2)'
    + 'BIND (REPLACE(?test_url2,"^www.","") AS ?test_url)'
    + 'BIND (REPLACE(?formatter_url0,"^https://","") AS ?formatter_url1)'
    + 'BIND (REPLACE(?formatter_url1,"^http://","") AS ?formatter_url2)'
    + 'BIND (REPLACE(?formatter_url2,"^www.","") AS ?formatter_url)'
    + 'FILTER (CONTAINS( ?formatter_url, "$1" ) )'
    + 'BIND (STRBEFORE( ?formatter_url, "$1" ) AS ?f_url_start )'
    + 'BIND (STRAFTER( ?formatter_url, "$1" ) AS ?f_url_end )'
    + 'FILTER(STRSTARTS( ?test_url, ?f_url_start ))'
    + 'FILTER(STRENDS( ?test_url, ?f_url_end ))'
    + 'BIND (SUBSTR( ?test_url, 1+STRLEN(?f_url_start), STRLEN(?test_url)-STRLEN(?f_url_start)-STRLEN(?f_url_end)) AS ?id_uncut )'
    + '{?prop p:P1793/ps:P1793 ?regex .}'
    + 'UNION'
    + '{?prop p:P2302 ?statement .'
    + '?statement ?ps wd:Q21502404 .'
    +  '?statement pq:P1793 ?regex .}'
    + 'BIND (REPLACE (?id_uncut, CONCAT("(",?regex,").*"),"$1","i") AS ?id)'
    + 'BIND (LCASE(?id) AS ?lcid)'
    + '?prop wikibase:directClaim ?propRel .'
    + '{?iri ?propRel ?id .} UNION {?iri ?propRel ?lcid .}'
    + "SERVICE wikibase:label { bd:serviceParam wikibase:language '" + isoLanguage + "' } ."
    + '}'
    + 'ORDER BY ASC(?name)';

  var encodedQuery = encodeURIComponent(string);

  addInProgressText(1, encodedQuery);


  fetch('https://query.wikidata.org/sparql?query=' + encodedQuery, {
	 //method: 'GET',
 	 headers: {
   		'Accept': 'application/json'//,
		//'Api-User-Agent': 'Entity-Explosion (https://www.wikidata.org/wiki/Wikidata:Entity_Explosion)'
 	}
  })
	.then(
		function (response) {
			//console.log(response);
			return response.json();
		}
	  )
	.then(
		function (data) {
			//console.log(data);
      if (data.results.bindings.length == 0) {
        chrome.action.setIcon({ path: "./images/EE-black-38.png" });
        //no_result();
		specific_website_QID_search(isoLanguage, tabURL);
      } else {
        for (i = 0; i < data.results.bindings.length; i++) {
          // concatenate the Q number on the end of the label (Q extracted from iri after 31 other url characters)
          label = data.results.bindings[i].iriLabel.value + ' (' + data.results.bindings[i].iri.value.substring(31, data.results.bindings[i].iri.value.length) + ')'
          iri = data.results.bindings[i].iri.value
          // add the new information to the dropdown list
          $("#box1").append("<option value='" + iri + "'>" + label + '</option>');
        }
		  
        chrome.action.setIcon({ path: "./images/EE-emerald-38.png" });
        if (data.results.bindings.length == 1) {
          document.getElementById("box1").selectedIndex = "1"; //when only one item is returned, it's a match
          box1change();
        }
      }
		}
	)
 	.catch(
		function (error) {
		console.error('Unable to get items.', error);
	}
  )
}

function nthIndex(str, pat, n) {
  var L = str.length, i = -1;
  while (n-- && i++ < L) {
    i = str.indexOf(pat, i);
    if (i < 0) break;
  }
  return i;
}

function wiki_QID_search(isoLanguage, tabURL) {
  var encodedTitle = tabURL.substring(1 + tabURL.lastIndexOf("/"));
  var site = tabURL.substring(0, nthIndex(tabURL, "/", 3));
  
  //console.log('wiki QID search: '+tabURL);
 
  var queryString = site + "/w/api.php?action=query&prop=pageprops&titles=" + encodedTitle + "&format=json";

  // send query to endpoint, see https://en.wikipedia.org/wiki/Wikipedia:Finding_a_Wikidata_ID
  fetch(queryString, {
	 method: 'GET',
 	 headers: {
   		'Accept': 'application/json',
	    'Api-User-Agent': 'Entity-Explosion (https://www.wikidata.org/wiki/Wikidata:Entity_Explosion)'
 	}
  })
	.then(
		function (response) {
			//console.log(response);
			return response.json();
		}
	  )
	.then(
		function (data) {
			//console.log(data);
      var count = 0

      //console.log("RESULT->DATA check, length: "+Object.values(data.query.pages).length)
      for (i = 0; i < Object.values(data.query.pages).length; i++) {
        if (typeof Object.values(data.query.pages)[i].pageprops !== 'undefined') {
          if (typeof Object.values(data.query.pages)[i].pageprops.wikibase_item !== 'undefined') {
            count = count + 1
            QID = Object.values(data.query.pages)[i].pageprops.wikibase_item
            // concatenate the Q number on the end of the label (Q extracted from iri after 31 other url characters)
            label = encodedTitle + ' (' + QID + ')'
            label = replaceAll(label, "_", " ");
            iri = 'http://www.wikidata.org/entity/' + QID
            // add the new information to the dropdown list
            $("#box1").append("<option value='" + iri + "'>" + label + '</option>');
          }
        }
      }
      if (count == 0) {
        chrome.action.setIcon({ path: "./images/EE-black-38.png" });
        no_result();
      } else {
        chrome.action.setIcon({ path: "./images/EE-emerald-38.png" });
        if (count == 1) {
          document.getElementById("box1").selectedIndex = "1"; //when only one item is returned, it's a match
          box1change();
        }
      }
    }
	)
 	.catch(
		function (error) {
		console.error('Unable to get items.', error);
	}
  )
}

function wikidata_QID_search(isoLanguage, tabURL) {
  var encodedTitle = tabURL.substring(1 + tabURL.lastIndexOf("/"));
  var site = tabURL.substring(0, nthIndex(tabURL, "/", 3));

  //console.log('wikidata QID search: '+tabURL);

  if (encodedTitle.startsWith("Property:")) {
    QID = encodedTitle.substring(9)
  } else {
    QID = encodedTitle
  }

  // concatenate the Q number on the end of the label (Q extracted from iri after 31 other url characters)
  label = encodedTitle + ' (' + QID + ')'
  iri = 'http://www.wikidata.org/entity/' + QID

  // add the new information to the dropdown list
  $("#box1").append("<option value='" + iri + "'>" + label + '</option>');

  chrome.action.setIcon({ path: "./images/EE-emerald-38.png" });
  document.getElementById("box1").selectedIndex = "1"; //when only one item is returned, it's a match
  box1change();
}


function setStatusOptions(isoLanguage) {
  // start the status dropdown over with "Select/Selecionar/Wählen" as the first option
  $("#box1 option:gt(0)").remove();
  /*	
  if (isoLanguage == 'en') { $("#box1 option").text("(Select)"); }
  if (isoLanguage == 'pt') { $("#box1 option").text("(Selecionar)"); }
  if (isoLanguage == 'de') { $("#box1 option").text("(Wählen)"); }
  if (isoLanguage == 'es') { $("#box1 option").text("(Seleccionar)"); }
  if (isoLanguage == 'zh-hans') { $("#box1 option").text("(选择)"); }
  if (isoLanguage == 'zh-hant') { $("#box1 option").text("(選擇)"); }
  */
  //$("#box1 option").text = chrome.i18n.getMessage("select");
  document.getElementById("select").textContent = chrome.i18n.getMessage("select");
	
  if (typeof tabURL !== 'undefined') {
    if ((tabURL.includes("commons.wikimedia.org")) ||
      (tabURL.includes("species.wikimedia.org")) ||
      (tabURL.includes(".wikipedia.org")) ||
      (tabURL.includes(".wikibooks.org")) ||
      (tabURL.includes(".wikinews.org")) ||
      (tabURL.includes("wikifunctions.org")) ||
      (tabURL.includes(".wikiquote.org")) ||
      (tabURL.includes(".wikisource.org")) ||
      (tabURL.includes(".wikiversity.org")) ||
      (tabURL.includes(".wikivoyage.org")) ||
      (tabURL.includes(".wiktionary.org"))
    ) {
      wiki_QID_search(isoLanguage, tabURL)
    } else if (tabURL.includes("wikidata.org")) {
      wikidata_QID_search(isoLanguage, tabURL)
    } else {
      general_QID_search(isoLanguage, tabURL);
    }
  }
}

function box0change() {
  // searching, so show the spinner icon
  $('#searchSpinner').show();
  isoLanguage = $("#box0").val();
  //savedIsoLanguage = isoLanguage;
  sendIsoLanguage()
  redrawLabels(isoLanguage)

  setStatusOptions(isoLanguage);

  $("#div1").html('');
  $('#searchSpinner').hide();
}


function no_result() {
  addProgressText(
    'noResultText',
    'https://www.wikidata.org/w/index.php?sort=relevance&search=&title=Special:Search&profile=advanced&fulltext=1&advancedSearch-current=%7B%7D&ns0=1&ns146=1',
    'https://www.wikidata.org/wiki/Special:NewItem'
  );

  $("#box1 option").text(chrome.i18n.getMessage("noResultDropdown"));
}

function div_wd_change() {
  var isoLanguage = $("#box0").val();
  var iri = $("#box1").val();

  text = '';
  if (typeof language_translations == 'undefined') {
    requestLanguages()
    text = text + 'Wikidata'
  } else {
    for (var i = 0; i < Object.keys(language_translations).length; i++) {
      if (typeof language_translations[i].lang !== 'undefined') {
        if (language_translations[i].lang.localeCompare(isoLanguage) == 0) {
          if (typeof language_translations[i].data !== 'undefined') {
			//text = text + language_translations[i].data
			if (rtl_language_codes.includes(isoLanguage)) {
			  text = text + rtle + language_translations[i].data
			} else {
			  text = text + ltre + language_translations[i].data
			}
          } else {
            text = text + 'Wikidata'
          }
          break
        }
      }
    }
  }
  text = text + ': <b><a target="_blank" href="' + iri + '">'+ ltre + iri.substring(31, iri.length) + pdf +'</a></b><br/>';
  //$("#div_wdlink").html(text);

  const parser = new DOMParser()
  const parsed = parser.parseFromString(text, 'text/html')
  const tags = parsed.getElementsByTagName('body')
  $("#div_wdlink").html('');
  //for (const tag of tags) {
  //  $("#div_wdlink").append(tag.innerHTML)
  //}
  for (var i = 0; i < tags.length; i++) {
    $("#div_wdlink").append(tags[i].innerHTML)
  }

}

function div1change() {
  var iri = $("#box1").val();
  var isoLanguage = $("#box0").val();
  // create URI-encoded query string to get item names and IRIs
  var string = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>'
    + 'PREFIX wd: <http://www.wikidata.org/entity/>'
    + 'PREFIX wdt: <http://www.wikidata.org/prop/direct/>'
    + 'SELECT DISTINCT ?property ?value WHERE {'
    + '<' + iri + '> ?propertyUri ?valueUri.'
    + '?valueUri rdfs:label ?value.'
    + '?genProp <http://wikiba.se/ontology#directClaim> ?propertyUri.'
    + '?genProp rdfs:label ?property.'
    + 'FILTER(substr(str(?propertyUri),1,36)="http://www.wikidata.org/prop/direct/")'
    + 'FILTER(LANG(?property) = "' + isoLanguage + '")'
    + 'FILTER(LANG(?value) = "' + isoLanguage + '")'
    + '}'
    + 'ORDER BY ASC(?property)';
  var encodedQuery = encodeURIComponent(string);

  fetch('https://query.wikidata.org/sparql?query=' + encodedQuery, {
 	 //method: 'GET',
	 headers: {
   		'Accept': 'application/json'//,
		//'Api-User-Agent': 'Entity-Explosion (https://www.wikidata.org/wiki/Wikidata:Entity_Explosion)'
 	}
  })
	.then(
		function (response) {
			//console.log(response);
			return response.json();
		}
	  )
	.then(
		function (data) {
			//console.log(data);
      text = ''
      for (i = 0; i < data.results.bindings.length; i++) {
        property = data.results.bindings[i].property.value
        value = data.results.bindings[i].value.value
		if (rtl_language_codes.includes(isoLanguage)) {
			text = text + rtle + property + ': <b>' + value + pdf + '</b><br/>'
		} else {
			text = text + ltre + property + ': <b>' + value + pdf + '</b><br/>'			
		}
      }
      //$("#div1").html(text);

      const parser = new DOMParser()
      const parsed = parser.parseFromString(text, 'text/html')
      const tags = parsed.getElementsByTagName('body')
      $("#div1").html('');
	  for (var i = 0; i < tags.length; i++) {
    	$("#div1").append(tags[i].innerHTML)
  	  }

      $('#searchSpinner').hide();
    }
	)
 	.catch(
		function (error) {
		console.error('Unable to get items.', error);
	}
  )
}

function div2change() {
  var iri = $("#box1").val();

  var isoLanguage = $("#box0").val();
  // create URI-encoded query string to get property names, IDs, and compiled link URLs. model query here: https://w.wiki/XNq
  var string = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>'
    + 'PREFIX wd: <http://www.wikidata.org/entity/>'
    + 'PREFIX wdt: <http://www.wikidata.org/prop/direct/>'
    + 'SELECT DISTINCT ?property ?valueUri ?URL WHERE {'
    + '<' + iri + '>  ?propertyUri ?valueUri.'
    + '?genProp <http://wikiba.se/ontology#directClaim> ?propertyUri.'
    + '?genProp rdfs:label ?property.'
    + 'FILTER(substr(str(?propertyUri),1,36)="http://www.wikidata.org/prop/direct/")'
    + 'FILTER(LANG(?property) = "' + isoLanguage + '")'
    + 'FILTER(substr(str(?valueUri),1,31)!="http://www.wikidata.org/entity/")'
    + 'OPTIONAL { ?genProp wdt:P1630 ?fmt_URL . }'
    + 'FILTER(!BOUND(?fmt_URL))'
    + '}'
    + 'ORDER BY ASC(?property)'

  var encodedQuery = encodeURIComponent(string);

  fetch('https://query.wikidata.org/sparql?query=' + encodedQuery, {
	 //method: 'GET',
 	 headers: {
   		'Accept': 'application/json'//,
	    //'Api-User-Agent': 'Entity-Explosion (https://www.wikidata.org/wiki/Wikidata:Entity_Explosion)'
 	}
  })
	.then(
		function (response) {
			//console.log(response);
			return response.json();
		}
	  )
	.then(
		function (data) {
			//console.log(data);
      text = ''
      for (i = 0; i < data.results.bindings.length; i++) {
        property = data.results.bindings[i].property.value
        value = data.results.bindings[i].valueUri.value

        if ((value.startsWith("http://")) || ((value.startsWith("https://")))) {
          //text = text + property + ': <b><a target="_blank" href="' + value + '">' + value + '</a></b><br/>'
		  if (rtl_language_codes.includes(isoLanguage)) {
			text = text + rtle + rtle + property + ': '+ pdf + '<b><a target="_blank" href="' + value + '">' + rtle + value + pdf + pdf +'</a></b><br/>'
		  } else {
			text = text + ltre + ltre + property + ': '+ pdf + '<b><a target="_blank" href="' + value + '">' + ltre + value + pdf + pdf +'</a></b><br/>'
		  }			
        } else {
          //text = text + property + ': <b>' + value + '</b><br/>'
		  if (rtl_language_codes.includes(isoLanguage)) {
			text = text + rtle + rtle + property + ': '+ pdf +'<b>' + ltre + value + pdf + pdf + '</b><br/>'
			//the latter ltre here is to preserve ltr-default results e.g. signed time strings like "-665000000-01-01T00:00:00Z" at Q729
		  } else {
			text = text + ltre + ltre + property + ': '+ pdf +'<b>' + ltre + value + pdf + pdf + '</b><br/>'
		  }
		}

      }
      //$("#div2").html(text);

      const parser = new DOMParser()
      const parsed = parser.parseFromString(text, 'text/html')
      const tags = parsed.getElementsByTagName('body')
      $("#div2").html('');
      //for (const tag of tags) {
      //  $("#div2").append(tag.innerHTML)
      //}
	  for (var i = 0; i < tags.length; i++) {
		$("#div2").append(tags[i].innerHTML)  
  	  }
      $('#searchSpinner').hide();
    }
	)
 	.catch(
		function (error) {
		console.error('Unable to get items.', error);
	}
  )
}

function div3change() {
  var iri = $("#box1").val();

  var isoLanguage = $("#box0").val();
  // create URI-encoded query string to get property names, IDs, and compiled link URLs. 
  var string = 'SELECT DISTINCT ?genProp ?property ?valueUri ?fmt_URL ?URL ?rankstr ?regex_req ?regex ?lang ?format ?part ?operatorLabel ?jurisdiction WHERE {'
    + '<' + iri + '>  ?propertyUri ?valueUri.'
    + '?genProp <http://wikiba.se/ontology#directClaim> ?propertyUri.'
    + '?genProp rdfs:label ?property.'
    + 'FILTER(LANG(?property) = "' + isoLanguage + '")'
    + 'FILTER(substr(str(?propertyUri),1,36)="http://www.wikidata.org/prop/direct/")'
    + 'FILTER(substr(str(?valueUri),1,31)!="http://www.wikidata.org/entity/")'
    + '{'
    + '?genProp p:P1630 ?statement .'
    + '?statement ps:P1630 ?fmt_URL .'
    + '?statement wikibase:rank ?rank .'
    + 'BIND (STR(?rank) AS ?rankstr)'
    + 'OPTIONAL {?statement pq:P8460 ?regex_req .}'
    + 'OPTIONAL {?statement pq:P1793 ?regex .}'
    + 'OPTIONAL {?statement pq:P407/wdt:P424 ?lang .}'
    + 'OPTIONAL {?statement pq:P2701 ?format .}'
    + 'OPTIONAL {?statement pq:P518 ?part .}'
    + 'OPTIONAL {?statement pq:P137 ?operator .}'
    + 'OPTIONAL {?statement pq:P1001 ?jurisdiction .}'
    + '} UNION {'
    + '?genProp p:P3303 ?statement .'
    + '?statement ps:P3303 ?fmt_URL .'
    + '?statement wikibase:rank ?rank.'
    + 'BIND (STR(?rank) AS ?rankstr)'
    + 'OPTIONAL {?statement pq:P8460 ?regex_req .}'
    + 'OPTIONAL {?statement pq:P1793 ?regex .}'
    + 'OPTIONAL {?statement pq:P407/wdt:P424 ?lang .}'
    + 'OPTIONAL {?statement pq:P2701 ?format .}'
    + 'OPTIONAL {?statement pq:P518 ?part .}'
    + 'OPTIONAL {?statement pq:P137 ?operator .}'
    + 'OPTIONAL {?statement pq:P1001 ?jurisdiction .}'
    + '}'
    + 'BIND (REPLACE( STR(?fmt_URL), "\\\\$1", ?valueUri ) AS ?URL)'
    + 'FILTER(BOUND(?URL))'
    + 'BIND (CONCAT(?property,?valueUri) AS ?sort)'
    + 'SERVICE wikibase:label { bd:serviceParam wikibase:language "' + isoLanguage + ',[AUTO_LANGUAGE],en" } .'
    + '}'
    + 'ORDER BY ASC(?sort)'


  var encodedQuery = encodeURIComponent(string);

  fetch('https://query.wikidata.org/sparql?query=' + encodedQuery, {
	 //method: 'GET',
 	 headers: {
   		'Accept': 'application/json'//,
		//'Api-User-Agent': 'Entity-Explosion (https://www.wikidata.org/wiki/Wikidata:Entity_Explosion)'
 	}
  })
	.then(
		function (response) {
			//console.log(response);
			return response.json();
		}
	  )
	.then(
		function (data) {
			//console.log(data);
      text = ''

      var clonedJson = jQuery.extend({}, data);

      for (i = 0; i < clonedJson.results.bindings.length; i++) {
        score = 0;
        rankstr = clonedJson.results.bindings[i].rankstr.value
        if (rankstr.indexOf("Normal") !== -1) { score = 10 }
        if (rankstr.indexOf("Preferred") !== -1) { score = 20 }
        if (rankstr.indexOf("Deprecated") !== -1) { score = -20 }

        if (typeof clonedJson.results.bindings[i].lang !== 'undefined') {
          if (clonedJson.results.bindings[i].lang.value == isoLanguage) {
            score += 6;
          } else {
            if (clonedJson.results.bindings[i].lang.value == "en") {
              score -= 5; // if all languages are different, choose English
            } else {
              score -= 6;
            }
          }
        }

        if (typeof clonedJson.results.bindings[i].part !== 'undefined') {
          score -= 2; //applies to part limits the scope of how often this will resolve. Could instead check if this item is a member of that part.
        }

        if (typeof clonedJson.results.bindings[i].jurisdiction !== 'undefined') {
          score -= 2; //applies to jurisdiction limits the scope of how often this will resolve. Could instead check if this item is in this jurisdiction.
        }

        if (typeof clonedJson.results.bindings[i].operatorLabel !== 'undefined') {
          clonedJson.results.bindings[i].property.value = clonedJson.results.bindings[i].property.value + ' (' + clonedJson.results.bindings[i].operatorLabel.value + ')'
        }

        if (typeof clonedJson.results.bindings[i].regex_req !== 'undefined') {
          //console.log(clonedJson.results.bindings[i].regex_req.value+' =? '+clonedJson.results.bindings[i].valueUri.value)
          if (clonedJson.results.bindings[i].valueUri.value.match(clonedJson.results.bindings[i].regex_req.value)) {
            score += 8;
            //console.log('MATCH') 
          } else {
            score -= 20;
          }
        }

        clonedJson.results.bindings[i].score = score;
      }

      //sort that preserves alphabetically grouped order of properties, but sorts internally on score
      clonedJson.results.bindings.sort(function (a, b) {
        if ((a.property.value == b.property.value)&&(a.valueUri.value==b.valueUri.value)) { return b.score - a.score; }
        else { return (a.property.value.toLowerCase()+'   '+a.valueUri.value.toLowerCase() < b.property.value.toLowerCase()+'   '+b.valueUri.value.toLowerCase()) ? -1 : 1; }
      });

      //console.log(clonedJson)

      for (i = 0; i < clonedJson.results.bindings.length; i++) {
        property = clonedJson.results.bindings[i].property.value
        value = clonedJson.results.bindings[i].valueUri.value

        // simple replacement version
        linkURL = clonedJson.results.bindings[i].fmt_URL.value.replace("$1", clonedJson.results.bindings[i].valueUri.value)

        if (typeof clonedJson.results.bindings[i].regex_req !== 'undefined') {
          if (clonedJson.results.bindings[i].valueUri.value.match(clonedJson.results.bindings[i].regex_req.value)) {
            if (clonedJson.results.bindings[i].valueUri.value.match(clonedJson.results.bindings[i].regex_req.value).length > 1) {
              linkURL = clonedJson.results.bindings[i].fmt_URL.value;
              //console.log(clonedJson.results.bindings[i].valueUri.value.match(clonedJson.results.bindings[i].regex_req.value))
              for (m = 1; m < clonedJson.results.bindings[i].valueUri.value.match(clonedJson.results.bindings[i].regex_req.value).length; m++) {
                linkURL = linkURL.replace('$' + m, clonedJson.results.bindings[i].valueUri.value.match(clonedJson.results.bindings[i].regex_req.value)[m])
              }
              //console.log('value '+clonedJson.results.bindings[i].valueUri.value+' regex: '+clonedJson.results.bindings[i].regex_req.value+' formatter: '+clonedJson.results.bindings[i].fmt_URL.value+' replaced linkURL: '+linkURL)
              //							console.log('value '+clonedJson.results.bindings[i].valueUri.value+' regex: '+clonedJson.results.bindings[i].regex_req.value)
              //							console.log(' formatter: '+clonedJson.results.bindings[i].fmt_URL.value+' replaced linkURL: '+linkURL)
            }
          }
          // else the link will probably fail, maybe shouldn't make it
        }

        //rankstr = clonedJson.results.bindings[i].rankstr.value
        //if (rankstr.indexOf("Normal") !== -1) {console.log("normal found: "+rankstr)}

        if (i !== 0) {
          if ((clonedJson.results.bindings[i].property.value == clonedJson.results.bindings[i - 1].property.value)&&(clonedJson.results.bindings[i].valueUri.value == clonedJson.results.bindings[i - 1].valueUri.value)) {
            continue; //skip outscored duplicates				
          }
          if (score < 0) {
            continue; //deprecated, don't show, even if best
          }
        }

        //text = text + property;
		if (rtl_language_codes.includes(isoLanguage)) {
			text = text + rtle + property + ' '
		} else {
			text = text + ltre + property + ' '
		}

        if (typeof clonedJson.results.bindings[i].lang !== 'undefined') {
          if (clonedJson.results.bindings[i].lang.value !== isoLanguage) {
            text = text + ltre+'[' + clonedJson.results.bindings[i].lang.value + ']'+pdf
          }
        }
        //text = text+ ': <b><a target="_blank" href="'+encodeURI(linkURL)+'">' + value + '</a></b>' + ' score:'+clonedJson.results.bindings[i].score+'<br/>'
 		if (rtl_language_codes.includes(isoLanguage)) {
			text = text + rtle + ': '+ pdf
		} else {
			text = text + ltre + ': '+ pdf
		}

		text = text + '<b><a target="_blank" href="' + encodeURI(linkURL) + '">' +ltre + value + pdf + '</a></b>'+ pdf +'<br/>'


        $('#searchSpinner').hide();
      }

      const parser = new DOMParser()
      const parsed = parser.parseFromString(text, 'text/html')
      const tags = parsed.getElementsByTagName('body')
      $("#div3").html('');
      //for (const tag of tags) {
      //  $("#div3").append(tag.innerHTML)
      //}
	  for (var i = 0; i < tags.length; i++) {
	    $("#div3").append(tags[i].innerHTML)
  	  }


    }
	)
 	.catch(
		function (error) {
		console.log('Unable to get items: ', error);
	}
  )
}

function div_wiki_change() {
  var iri = $("#box1").val();
  var isoLanguage = $("#box0").val();

  // create URI-encoded query string to get property names, IDs, and compiled link URLs. model query here: https://w.wiki/XNq
  var string = 'PREFIX schema: <http://schema.org/>'
				+'SELECT DISTINCT ?article ?articlelang WHERE {'
  				+'?article schema:about <' + iri + '> .'
  				+'?article schema:inLanguage ?articlelang .'
				+'}'
  var encodedQuery = encodeURIComponent(string);

  fetch('https://query.wikidata.org/sparql?query=' + encodedQuery, {
	 //method: 'GET',
 	 headers: {
   		'Accept': 'application/json'//,
		//'Api-User-Agent': 'Entity-Explosion (https://www.wikidata.org/wiki/Wikidata:Entity_Explosion)'
 	}
  })
	.then(
		function (response) {
			//console.log(response);
			return response.json();
		}
	  )
	.then(
		function (data) {
			//console.log(data);
 	  text = ''
	  for (var i = 0; i < data.results.bindings.length; i++) {
				
		var article = decodeURIComponent(data.results.bindings[i].article.value)  // the decode fixes characters from other scripts, e.g. Māori
		var articlelang = data.results.bindings[i].articlelang.value
				
		site = 'article' //default, will apply to "other sites"

        if ((articlelang.localeCompare(isoLanguage) == 0) || article.includes("commons.wikimedia.org") || article.includes("species.wikimedia.org")) {
          //this specifies the language version, but also includes two multilingual projects
          if (typeof language_translations == 'undefined') {
            requestLanguages()
          } else {
            for (var j = 0; j < Object.keys(language_translations).length; j++) {
              if (typeof language_translations[j].lang == 'undefined') {
                console.log("language translations undefined")
              } else {

                if (language_translations[j].lang.localeCompare(isoLanguage) !== 0) {
                  //console.log("labels in different language:"+language_translations[j].lang+"!="+isoLanguage)
                } else {
                  //Commons and Wikispecies always get through the language conditional because they apply to all languages
                  if (article.includes("commons.wikimedia.org")) {
                    if (typeof language_translations[j].commons !== 'undefined') {
                      site = language_translations[j].commons
                    } else {
                      site = 'Wikimedia Commons'
                    }
                  }
                  if (article.includes("species.wikimedia.org")) {
                    if (typeof language_translations[j].species !== 'undefined') {
                      site = language_translations[j].species
                    } else {
                      site = 'Wikispecies'
                    }
                  }

                  if (article.includes(".wikipedia.")) {
                    if (typeof language_translations[j].pedia !== 'undefined') {
                      site = language_translations[j].pedia
                    } else {
                      site = 'Wikipedia'
                    }
                  }
                  if (article.includes(".wikibooks.")) {
                    if (typeof language_translations[j].books !== 'undefined') {
                      site = language_translations[j].books
                    } else {
                      site = 'Wikibooks'
                    }
                  }
                  if (article.includes("wikifunctions.")) {
                    if (typeof language_translations[j].functions !== 'undefined') {
                      site = language_translations[j].functions
                    } else {
                      site = 'Wikifunctions'
                    }
                  }
                  if (article.includes(".wikinews.")) {
                    if (typeof language_translations[j].news !== 'undefined') {
                      site = language_translations[j].news
                    } else {
                      site = 'Wikinews'
                    }
                  }
                  if (article.includes(".wikiquote.")) {
                    if (typeof language_translations[j].quote !== 'undefined') {
                      site = language_translations[j].quote
                    } else {
                      site = 'Wikiquote'
                    }
                  }
                  if (article.includes(".wikisource.")) {
                    if (typeof language_translations[j].source !== 'undefined') {
                      site = language_translations[j].source
                    } else {
                      site = 'Wikisource'
                    }
                  }
                  if (article.includes(".wikiversity.")) {
                    if (typeof language_translations[j].versity !== 'undefined') {
                      site = language_translations[j].versity
                    } else {
                      site = 'Wikiversity'
                    }
                  }
                  if (article.includes(".wikivoyage.")) {
                    if (typeof language_translations[j].voyage !== 'undefined') {
                      site = language_translations[j].voyage
                    } else {
                      site = 'Wikivoyage'
                    }
                  }
                  if (article.includes(".wiktionary.")) {
                    if (typeof language_translations[j].tionary !== 'undefined') {
                      site = language_translations[j].tionary
                    } else {
                      site = 'Wiktionary'
                    }
                  }
                }
              }
            }
          }

          name = replaceAll(article.substring(1 + article.lastIndexOf("/")), "_", " ");
          //console.log(text+" <... + ...>"+name+" i= "+i)
			
          //text = text + site + ': <b><a target="_blank" href="' + article + '">' + name + '</a></b><br/>'
		  if (rtl_language_codes.includes(isoLanguage)) {
			text = text + rtle + site + ': <b><a target="_blank" href="' + article + '">' + name + pdf + '</a></b><br/>'
		  } else {
			text = text + ltre + site + ': <b><a target="_blank" href="' + article + '">' + name + pdf +'</a></b><br/>'
		  }
	
        }

        $('#searchSpinner').hide();
      }

      // later could display mini map if the item has coords			
      $("#div_wiki").html(text);

      const parser = new DOMParser()
      const parsed = parser.parseFromString(text, 'text/html')
      const tags = parsed.getElementsByTagName('body')
      $("#div_wiki").html('');
      //for (const tag of tags) {
      //  $("#div_wiki").append(tag.innerHTML)
      //}
	  for (var i = 0; i < tags.length; i++) {
	    $("#div_wiki").append(tags[i].innerHTML)
  	  }

    }
	)
 	.catch(
		function (error) {
		console.error('Unable to get items.', error);
	}
  )
}

function div_title_change() {
  var iri = $("#box1").val();
  var isoLanguage = $("#box0").val();

  // model query here: https://w.wiki/5xSu
  var string = 'PREFIX schema: <http://schema.org/>'
    + 'SELECT DISTINCT ?itemLabel ?itemDesc ?image WHERE {'
	+ 'OPTIONAL {<' + iri + '> rdfs:label ?itemLabel.'
	+ 'FILTER(LANG(?itemLabel) = "' + isoLanguage + '")}'
	+ 'OPTIONAL {<' + iri + '> schema:description ?itemDesc.'
	+ 'FILTER ( lang(?itemDesc) = "' + isoLanguage + '" )}'
	+ 'OPTIONAL {'
	+ '?subProperties wdt:P1647* wd:P18.'
    + '?subProperties wikibase:directClaim ?propertyRel.'
    + '<' + iri + '> ?propertyRel ?image.'
	+ '}'
    + '}'
	+ 'ORDER BY ASC(xsd:integer(STRAFTER(STR(?subProperties), "P")))'
	+ 'LIMIT 1'
  var encodedQuery = encodeURIComponent(string);


  fetch('https://query.wikidata.org/sparql?query=' + encodedQuery, {
	 //method: 'GET',
 	 headers: {
   		'Accept': 'application/json'//,
		//'Api-User-Agent': 'Entity-Explosion (https://www.wikidata.org/wiki/Wikidata:Entity_Explosion)'
 	}
  })
	.then(
		function (response) {
			//console.log(response);
			return response.json();
		}
	  )
	.then(
		function (data) {
			//console.log(data);
      let text = ''
      for (var i = 0; i < data.results.bindings.length; i++) {
		//there should only be one set of results (length=1)

		if (typeof data.results.bindings[i].image !== 'undefined') {
          var desc = data.results.bindings[i].image.value.substr(51)
          //text = text + '<h4>' + desc + '</h4>'
          text = text + '<a target="_blank" href="https://commons.wikimedia.org/wiki/File:' + desc + '"><img src="https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/' + desc + '&width=106" crossorigin="anonymous" referrerpolicy="no-referrer"></a>'
		}
		
		text = text + '<div>'
		  
		  
		if (typeof data.results.bindings[i].itemLabel !== 'undefined') {
		  var label = data.results.bindings[i].itemLabel.value
          text = text + '<h3>' + label + '</h3>'
		}
		if (typeof data.results.bindings[i].itemDesc !== 'undefined') {
          var desc = data.results.bindings[i].itemDesc.value
          text = text + '<h5>' + desc + '</h5>'
		}
        text = text + '</div>'

        $('#searchSpinner').hide();
      }
      $("#div_title").html(text);

      const parser = new DOMParser()
      const parsed = parser.parseFromString(text, 'text/html')
      const tags = parsed.getElementsByTagName('body')
      $("#div_title").html('');
      //for (const tag of tags) {
      //  $("#div_title").append(tag.innerHTML)
      //}
      for (var i = 0; i < tags.length; i++) {
  	    $("#div_title").append(tags[i].innerHTML)
  	  }

    }
	)
 	.catch(
		function (error) {
		console.error('Unable to get items.', error);
	}
  )
}

function box1change() {
  div_wd_change();
  div_title_change();
  div_wiki_change();
  div1change();
  div2change();
  div3change();
  //later could add images and maps
  redrawLabels(isoLanguage);
}

function gettabURL(callback) {
  //before doing anything to the window, we need both the URL and the initial language
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    tabURL = decodeURIComponent(tabs[0].url); // e.g. to fix https://www.quora.com/topic/M%C4%81ori-People
    //console.log(tabURL);
    callback();
  });
}

function initiateRedraw(iso) {
  update_languagebox(language_translations)
  selectElement("box0", iso)
  redrawLabels(iso)
  setStatusOptions(iso)
}

requestLanguages()

$(document).ready(function () {
// this is a jquery function https://learn.jquery.com/using-jquery-core/document-ready/
// the contents of this will only execute once the DOM is ready for JS code to execute

  document.documentElement.lang = chrome.i18n.getMessage("@@ui_locale");
  document.documentElement.dir = chrome.i18n.getMessage("@@bidi_dir");
	
  document.getElementById("boxLabel0").textContent = chrome.i18n.getMessage("initialBoxLabel0");
  document.getElementById('div_footer1').append(...parseHTML(chrome.i18n.getMessage('footer1')));
  document.getElementById('div_footer2').append(...parseHTML(chrome.i18n.getMessage('footer2', [
    'https://www.wikidata.org/wiki/Wikidata:Entity_Explosion',
    chrome.runtime.getManifest().version,
    'https://www.wikidata.org/wiki/User:99of9'
  ])));

	
  // not searching initially, so hide the spinner icon
  $('#searchSpinner').hide();

  // fires when there is a change in the language dropdown
  $("#box0").change(function () {
    box0change();
  });

  // fires when there is a change in the item dropdown
  $("#box1").change(function () {
    box1change();
  });

  // Main routine: 
  gettabURL(function () {
    if (typeof savedIsoLanguage !== 'undefined') {
      initiateRedraw(savedIsoLanguage)
    }
  });
});
