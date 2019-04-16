<h1 align='center'>Langue</h1>

Langue is a minimalistic and composable language highlighter for JS, that I built for fun.
It's currently used in my [Wiktor notebook engine](https://wiktor-wiki.github.io/).

## Usage

### Import base

```html
<script src="//gitcdn.link/cdn/evolbug/langue/master/langue.min.js"></script>
```

### Import languages

```html
<script src="//gitcdn.link/cdn/evolbug/langue/master/language/html.js"></script>
<script src="//gitcdn.link/cdn/evolbug/langue/master/language/lua.js"></script>
```

### Import basic theme (optional)

```html
<link
    rel="stylesheet"
    href="//gitcdn.link/cdn/evolbug/langue/master/langue.css"
/>
```

## Basic architectural idea

### Simplicity

-   Only a few common syntax groups:
    -   Keyword
    -   Special
    -   Punctuation
    -   Comment
    -   String
-   Regex based rules
-   String and comment matchers are auto-built from given start/end tokens

### Composable architecture:

-   Ability to inject definitions within definitions (JS/CSS in HTML)
-   Best-effort matching - ignore parts that don't match and continue
-   Ability to build your definitions progressively
