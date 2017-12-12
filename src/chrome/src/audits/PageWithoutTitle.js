// Copyright 2013 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.require('axs.AuditRules');
goog.require('axs.constants.Severity');

axs.AuditRules.addRule({
    name: 'pageWithoutTitle',
    heading: 'The web page should have a title that describes topic or purpose',
    url: 'https://github.com/GoogleChrome/accessibility-developer-tools/wiki/Audit-Rules#ax_title_01',
    severity: axs.constants.Severity.WARNING,
    relevantElementMatcher: function(element) {
        return element.tagName.toLowerCase() == 'html';
    },
    test: function(scope) {
        var head = scope.querySelector('head');
        if (!head)
          return true;
        var title = head.querySelector('title');
        if (!title)
            return true;
        return !title.textContent;
    },
    code: 'AX_TITLE_01'
});
