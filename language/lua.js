langue.syntax.lua = [
    [c`--[[,]]`],
    [s`","|','|[[,]]|[=[,]=]|[==[,]==]`],
    [sw`\\b(self)\\b`],
    [
        kw`\\b(break|do|else|elseif|end|for|function|if|in|local|repeat|return|then|until|while|and|or|not)\\b`,
    ],
    [sw`(\\w|_)(\\w|[0-9]|_)*\\s*(?=\\(|\\{)`],
    [sw`(\\w|_)(\\w|[0-9]|_)*`, s`","|','|[[,]]|[=[,]=]|[==[,]==]`],
    [p`\\+|-|\\*|/|#|\\[|\\]|\\{|\\}|\\(|\\)|,|\\.|<|>|=|:|;`],
];

langue.languages.lua = Language(langue.syntax.lua);
