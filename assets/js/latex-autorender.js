// https://rl.ai/posts/hugo-customization/#custom-javascript
// Default options to use for rendering
// https://katex.org/docs/options.html
const defaultOptions = {
    throwOnError: true,
};

// Adriaan: I added this https://stackoverflow.com/questions/18749591/encode-html-entities-in-javascript
// looks like the author forgot to include it
String.fromHtmlEntities = function(string) {
    return (string+"").replace(/&#\d+;/gm,function(s) {
        return String.fromCharCode(s.match(/\d+/gm)[0]);
    })
};


/*  Apply KaTeX rendering to all <code> tags with class `language-{=latex}`. */
document.addEventListener("DOMContentLoaded", function() {

    // Regex for content enclosed like $$...$$
    blockExp = /^\s*\$\$\s*(.+?)\$\$/gms;

    // Regex for content enclosed like $...$, i.e. inline math
    // First, we use a lookbehind so we match text starting with "$" but not "$$":
    //      (?<!\$)\$
    // Then we match anything that isn't a "$" character or escaped like "\$":
    //      ([^\$]|\\\$)+
    // Finally we look for a closing "$" sign that isn't followed by another "$"
    // OR itself escaped as "\$":
    //      \$(?!\$)(?<!\\\$)
    // inlineExp = /^(?<!\$)\$(([^\$]|\\\$)+)\$(?!\$)(?<!\\\$)/gmsu;
    inlineExp = /^(?<!\$)\$(([^\$]|\\\$)+)\$(?!\$)(?<!\\\$)/msu;


    // Find inline code
    for (let elem of document.querySelectorAll('code')) {
        // Handle code blocks specified with `class="language-{=latex}"`
        if (elem.classList.contains(`language-{=latex}`) ||
            elem.classList.contains(`language-latex`)) {
            // Handle case where <code> tag is contained in <pre>
            if (elem.parentNode.tagName === 'PRE') {
                elem = elem.parentNode;
            }

            // Process the content
            let content = String.fromHtmlEntities(elem.textContent);
            let output = [];
            const matches = content.matchAll(blockExp);
            for (const match of matches) {
                // Render the math expression to an HTML string
                //let result = katex.renderToString(match[1], elem, {...defaultOptions, displayMode: true});

                // Embed in <p> and <span> tags like `renderMathInElement` does
                //result = "".concat('<p><span class="katex-display">', result, '</span></p>');
                let result = "<div>$$" + match[1] + "$$</div>";
                output.push(result);
            }

            // Embed output inside containing <div>
            let container = document.createElement("div");
            container.classList.add("rendered-latex");
            container.innerHTML = output.join("\n");

            // Replace the element with container div
            elem.replaceWith(container);
        } else {
            // Look for inline math elements
            let content = String.fromHtmlEntities(elem.textContent);

            // Ignore <code> tags that don't begin with "$"
            if (!content.startsWith(`$`)){
                continue;
            }

            let match = content.match(inlineExp);
            if (match) {
                let result = katex.renderToString(match[1], elem, {...defaultOptions, displayMode: false});

                // Create element to contain the result
                let container = document.createElement("span");
                container.classList.add("rendered-latex");

                // Set inner HTML to KaTeX output and then replace the <code> element
                container.innerHTML = result;
                elem.replaceWith(container);
            }
        }
    }

    renderMathInElement(document.body, {
        delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
        ],
    });
});
