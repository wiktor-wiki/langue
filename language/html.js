langue.syntax.html = [
    [c`<!--,-->`],
    [p`<!`, sw`\\w+`, skip`[^>]*`, p`>`],
    [p`</`, kw`\\w+`, p`>`],
    [p`<`, kw`\\w+`, [skip`\\w+`, p`=`, s`","|','`], p`/?>`, skip`[^<]*`],
    [kw`&[#\\w\\d]+;`],
];

if (langue.syntax.js) {
    langue.syntax.html.unshift([
        p`<`,
        kw`script`,
        [skip`\\w+`, p`=`, s`","|','`],
        p`>`,
        langue.syntax.js,
        p`</`,
        kw`script`,
        p`>`,
    ]);
}

if (langue.syntax.css) {
    langue.syntax.html.unshift([
        p`<`,
        kw`style`,
        [skip`\\w+`, p`=`, s`","|','`],
        p`>`,
        langue.syntax.css,
        p`</`,
        kw`style`,
        p`>`,
    ]);
}

langue.languages.html = Language(langue.syntax.html);
