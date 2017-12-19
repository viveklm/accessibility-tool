/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, (tabs) => {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

/**
 * Change the level.
 *
 * @param {string} level.
 */
function reportEnable(param) {


  var script = ' var iDiv = document.createElement("div");' +
              'iDiv.id = "block_accessbility";  document.getElementsByTagName("body")[0].appendChild(iDiv); ' +
              ' var xmlhttp = new XMLHttpRequest(); ' +
              'xmlhttp.onreadystatechange = function() {  ' +
              '  if (this.readyState == 4 && this.status == 200) {   ' +
              '    document.getElementById("block_accessbility").innerHTML = this.responseText;      ' +
              '  } };  xmlhttp.open("POST","http://127.0.0.1:5000/evaluate",true);  ' +
              '  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");  ' +
              ' xmlhttp.send("source=" + document.documentElement.innerHTML + "&level=' + param + '" );';

  var documentSource = '';
  // See https://developer.chrome.com/extensions/tabs#method-executeScript.
  // chrome.tabs.executeScript allows us to programmatically inject JavaScript
  // into a page. Since we omit the optional first argument "tabId", the script
  // is inserted into the active tab of the current window, which serves as the
  // default.
  chrome.tabs.executeScript({
    code: script
  });
}

/**
 * Gets the saved level for url.
 *
 * @param {string} url URL whose level is to be retrieved.
 * @param {function(string)} callback called with the saved level for
 *     the given url on success, or a falsy value if no level is retrieved.
 */
function getSavedLevel(url, callback) {
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We check
  // for chrome.runtime.lastError to ensure correctness even when the API call
  // fails.
  chrome.storage.sync.get(url, (items) => {
    callback(chrome.runtime.lastError ? null : items[url]);
  });
}

/**
 * Sets the given level for url.
 *
 * @param {string} url URL for which level is to be saved.
 * @param {string} level The level to be saved.
 */
function saveLevel(url, level) {
  var items = {};
  items[url] = level;
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We omit the
  // optional callback since we don't need to perform any action once the
  // level is saved.
  chrome.storage.sync.set(items);
}

// This extension loads the saved level for the current tab if one
// exists. The user can select a new level from the dropdown for the
// current page, and it will be saved as part of the extension's isolated
// storage. The chrome.storage API is used for this purpose. This is different
// from the window.localStorage API, which is synchronous and stores data bound
// to a document's origin. Also, using chrome.storage.sync instead of
// chrome.storage.local allows the extension data to be synced across multiple
// user devices.
document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl((url) => {
    var dropdown = document.getElementById('dropdown');

    // Load the saved level for this page and modify the dropdown
    // value, if needed.
    getSavedLevel(url, (savedLevel) => {
      if (savedLevel) {
        reportEnable(savedLevel);
        dropdown.value = savedLevel;
      }
    });

    // Ensure the level is changed and saved when the dropdown
    // selection changes.
    dropdown.addEventListener('change', () => {
      reportEnable(dropdown.value);
      saveLevel(url, dropdown.value);
    });
  });
});
