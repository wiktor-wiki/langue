/**
 * Langue highlighter engine
 *
 * @author      Daniels Kursits <https://github.com/evolbug>
 * @copyright   Copyright (c) 2018 Daniels Kursits <https://github.com/evolbug/langue>
 * @license     http://opensource.org/licenses/MIT MIT License
 */

langue = (function() {
    /**
     * Escape a regex chunk
     *
     * @param {string} unsafe
     * @return {string}
     */
    function regEscape(unsafe) {
        return unsafe.replace(
            new RegExp("[.*+?^${}()|[\\]\\\\]", "gm"),
            "\\$&"
        );
    }

    /**
     * Escape a html chunk
     *
     * @param {string} unsafe
     * @return {string}
     */
    function htmlEscape(unsafe) {
        return unsafe
            .replace(new RegExp("&", "gm"), "&amp;")
            .replace(new RegExp("<", "gm"), "&lt;")
            .replace(new RegExp(">", "gm"), "&gt;")
            .replace(new RegExp('"', "gm"), "&quot;")
            .replace(new RegExp("'", "gm"), "&#039;");
    }

    /**
     * Match a given pattern, tag it with a classname
     *
     * @param {string} tag
     * @param {string} ex
     * @return {{class:string, value:string, index:number}}
     */
    function matcher(tag, ex) {
        let lookahead = new RegExp("(" + ex + ")");
        return (code, lastIndex = 0, flags = "ym") => {
            if (flags) {
                // Real match
                let real = new RegExp("(\\s*" + ex + "\\s*)", flags);
                real.lastIndex = lastIndex;
                let match = real.exec(code);
                return match
                    ? {
                          class: tag,
                          value: match[1],
                          index: match.index,
                      }
                    : false;
            } else {
                // Lookahead match
                let match = lookahead.exec(code.substr(lastIndex));
                return match
                    ? {
                          class: tag,
                          value: match[1],
                          index: match.index + lastIndex,
                      }
                    : false;
            }
        };
    }

    /**
     * Special
     * @param {RegExp} bits
     * @return {matcher}
     */
    function sw(bits, ...vars) {
        let ex = bits.reduce(
            (r, c, i) => `${r}${c}${vars[i] ? vars[i] : ""}`,
            ""
        );
        return matcher("special", ex);
    }

    /**
     * Punctuation
     *
     * @param {RegExp} bits
     * @return {matcher}
     */
    function p(bits, ...vars) {
        let ex = bits.reduce(
            (r, c, i) => `${r}${c}${vars[i] ? vars[i] : ""}`,
            ""
        );
        return matcher("punctuation", ex);
    }

    /**
     * Keyword
     *
     * @param {RegExp} bits
     * @return {matcher}
     */
    function kw(bits, ...vars) {
        let ex = bits.reduce(
            (r, c, i) => `${r}${c}${vars[i] ? vars[i] : ""}`,
            ""
        );
        return matcher("keyword", ex);
    }

    /**
     * String
     *
     * @param {"start,end|..."} bits
     * @return {matcher}
     */
    function s(bits, ...vars) {
        let ex = bits.reduce(
            (r, c, i) => `${r}${c}${vars[i] ? vars[i] : ""}`,
            ""
        );
        return matcher(
            "string",
            ex
                .split("|")
                .map(e => e.trim())
                .map(pair => {
                    pair = pair.split(",").map(e => regEscape(e.trim()));
                    return `(?:${pair[0]}(?:\\\\\\\\|\\\\${pair[1]}|.|\\s)*?${
                        pair[1]
                    })`;
                })
                .join("|")
        );
    }

    /**
     * Comment
     *
     * @param {"start,end|..."} bits
     * @return {matcher}
     */

    function c(bits, ...vars) {
        let ex = bits.reduce(
            (r, c, i) => `${r}${c}${vars[i] ? vars[i] : ""}`,
            ""
        );
        return matcher(
            "comment",
            ex
                .split("|")
                .map(e => e.trim())
                .map(pair => {
                    pair = pair.split(",").map(e => regEscape(e.trim()));
                    return `(?:${pair[0]}(?:.|\\s)*?${pair[1]})`;
                })
                .join("|")
        );
    }

    /**
     * Skip these (no class)
     *
     * @param {RegExp} bits
     * @return {matcher}
     */
    function skip(bits, ...vars) {
        let ex = bits.reduce(
            (r, c, i) => `${r}${c}${vars[i] ? vars[i] : ""}`,
            ""
        );
        return matcher("", ex);
    }

    /**
     * Parse a chunk of {code} using {pattern} starting from {lastIndex}
     *
     * @param {string} code
     * @param {array|matcher} pattern
     * @param {number} lastIndex
     * @return {array}
     */
    function parse(code, pattern, lastIndex = 0) {
        let results = { matches: [], lastIndex: lastIndex };
        let stuckIndex = lastIndex;

        for (let chunk_id = 0; chunk_id < pattern.length; chunk_id++) {
            let chunk = pattern[chunk_id];

            if (Array.isArray(chunk)) {
                let subset = parse(code, chunk, results.lastIndex);

                while (subset && subset.lastIndex > stuckIndex) {
                    stuckIndex = subset.lastIndex;
                    results.matches = results.matches.concat(subset.matches);
                    results.lastIndex = subset.lastIndex;
                    subset = parse(code, chunk, results.lastIndex);
                }
            } else {
                let match = chunk(code, results.lastIndex);
                if (!match) return false;

                results.lastIndex = match.index + match.value.length;
                results.matches.push(match);
            }
        }

        return results;
    }

    /**
     * Define a new language
     *
     * @param {array[]} definition
     * @return {function}
     */
    function Language(definition) {
        return function(code) {
            let match = true;
            let tokens = [];
            let lastIndex = 0;
            let stuckIndex = -1;

            while (match && lastIndex > stuckIndex) {
                let initial_matches = [];
                match = false;
                stuckIndex = lastIndex;

                for (let pattern = 0; pattern < definition.length; pattern++) {
                    let initial = definition[pattern][0](
                        code,
                        lastIndex,
                        false
                    );

                    if (initial) {
                        match = true;
                        initial_matches.push({
                            pattern: pattern,
                            match: initial,
                        });
                    }
                }

                initial_matches = initial_matches.sort(
                    (a, b) => a.match.index - b.match.index
                );

                for (let match of initial_matches) {
                    let result = parse(
                        code,
                        definition[match.pattern],
                        match.match.index
                    );
                    if (result) {
                        lastIndex = result.lastIndex;
                        tokens = tokens.concat(result.matches);
                        break;
                    }
                }
            }

            let result = [];
            let offset = 0;
            for (let t = 0; t < tokens.length; t++) {
                result.push(htmlEscape(code.slice(offset, tokens[t].index)));
                result.push(
                    `<span class='${tokens[t].class}'>${htmlEscape(
                        tokens[t].value
                    )}</span>`
                );
                offset = tokens[t].index + tokens[t].value.length;
            }

            result.push(htmlEscape(code.slice(offset)));
            return result.join("");
        };
    }

    /**
     * Highlight any string using the given language
     *
     * @param {string} code
     * @param {string} language
     * @return {string}
     */
    function langue(code, language) {
        if (langue.languages[language]) {
            return langue.languages[language](code);
        } else {
            console.error(`requested language ${language} is not defined`);
            return code;
        }
    }

    /**
     * Highlight a DOM object by automatically detecting language from classname
     *
     * @param {Node} code
     */
    langue.auto = function(code) {
        if (code.className)
            code.innerHTML = langue(
                code.innerText,
                code.className.match(/language-(\w+)/)[1]
            );
    };

    /**
     * Language parser function cache
     */
    langue.languages = {};

    /**
     * Syntax definition array cache
     */
    langue.syntax = {};

    return langue;
})();
