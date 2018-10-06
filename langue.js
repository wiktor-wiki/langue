"use strict";

function findall(regex_pattern, string_, typename) {
   var output_list = [];

   while (true) {
      var a_match = regex_pattern.exec(string_);
      if (a_match) {
         output_list.push([
            typename,
            a_match[1],
            a_match.index + (a_match[0].length - a_match[1].length),
         ]);
      } else {
         break;
      }
   }

   return output_list;
}

function process(source, tokens, i = 0, last = 0) {
   return tokens[i]
      ? source.slice(last, tokens[i][2]) +
           "<span class='" +
           tokens[i][0] +
           "'>" +
           htmlEscape(tokens[i][1]) +
           "</span>" +
           process(source, tokens, i + 1, tokens[i][2] + tokens[i][1].length)
      : "";
}

function compose(source, tokens) {
   for (var typea = 3; typea > 0; typea--) {
      for (var typeb = typea - 1; typeb >= 0; typeb--) {
         for (var itema = 0; tokens[typea][itema]; itema++) {
            for (var itemb = 0; tokens[typeb][itemb]; itemb++) {
               if (
                  !(
                     tokens[typea][itema][2] > tokens[typeb][itemb][2] ||
                     tokens[typea][itema][2] + tokens[typea][itema][1].length <
                        tokens[typeb][itemb][2] + tokens[typeb][itemb][1].length
                  )
               ) {
                  tokens[typeb][itemb] = ["", "", 0];
               }
            }
         }
      }
   }
   return process(
      source.innerText,
      []
         .concat(...tokens)
         .filter(e => e[0])
         .sort((a, b) => (a[2] >= b[2] ? 1 : -1))
   );
}

function regEscape(unsafe) {
   return unsafe.replace(new RegExp("[.*+?^${}()|[\\]\\\\]", "g"), "\\$&");
}

function htmlEscape(unsafe) {
   return unsafe
      .replace(new RegExp("&", "g"), "&amp;")
      .replace(new RegExp("<", "g"), "&lt;")
      .replace(new RegExp(">", "g"), "&gt;")
      .replace(new RegExp('"', "g"), "&quot;")
      .replace(new RegExp("'", "g"), "&#039;");
}

function loadLanguage(language, success) {
   language =
      "https://raw.githubusercontent.com/wiktor-wiki/languages/master/" +
      language.replace("language-", "") +
      ".json";

   return $.getJSON(language, { _: $.now() }, function(data) {
      data.keywords = new RegExp(data.keywords, "gm");

      data.punctuation = new RegExp(
         "(" +
            data.punctuation
               .split("")
               .map(regEscape)
               .join("|") +
            ")",
         "gm"
      );

      data.comment = new RegExp(
         "(" +
            data.comment
               .map(pair => "(?:" + pair[0] + "(?:.|\\s)*?" + pair[1] + ")")
               .join("|") +
            ")",
         "gm"
      );

      data.string = new RegExp(
         "(" +
            data.string
               .map(
                  pair =>
                     "(?:" +
                     regEscape(pair[0]) +
                     "(?:\\\\\\\\|\\\\" +
                     regEscape(pair[1]) +
                     "|.|\\s)*?" +
                     regEscape(pair[1]) +
                     ")"
               )
               .join("|") +
            ")",
         "gm"
      );

      success(data);
   });
}

function highlight(code) {
   if (code.className) {
      loadLanguage(code.className, function(lang) {
         var keywords = findall(lang.keywords, code.innerText, "keyword");
         var punctuation = findall(
            lang.punctuation,
            code.innerText,
            "punctuation"
         );
         var comments = findall(lang.comment, code.innerText, "comment");
         var strings = findall(lang.string, code.innerText, "string");

         code.innerHTML = compose(
            code,
            [punctuation, keywords, strings, comments]
         );
      });
   }
}
