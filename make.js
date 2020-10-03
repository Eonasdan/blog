const fs = require('fs');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const path = require('path');

const details = (file) => {
    const html = fs.readFileSync(`./posts/${file}`, 'utf8');
    const metaTag = new JSDOM(html).window.document.querySelector("post-meta");
    const article = new JSDOM(html).window.document.querySelector("article");
    // strip html tags, line breaks and extra spaces
    const articleBody = article.textContent.replace(/(\r\n|\n|\r)/gm, '').replace(/\s+/g, ' ');

    let baseMeta = {
        file: file.replace(path.extname(file),''),
        title: file.replace(path.extname(file), ''),
        body: articleBody,
        "postDate": fs.statSync(`./posts/${file}`).mtime
    };

    if (!metaTag || metaTag.textContent.replace(/(\r\n|\n|\r)/gm, '').replace(/\s+/g, '') === '') return baseMeta;

    const postMeta = JSON.parse(metaTag.textContent);
    return {
        ...baseMeta,
        ...postMeta
    };
};

let posts = fs
    .readdirSync('./posts')
    .filter(file => path.extname(file).toLowerCase() === '.html')
    .map(file => details(file))
    .sort((a, b) => {
        return +new Date(a.postDate) > +new Date(b.postDate) ? -1 : 0;
    });

fs.writeFileSync('./posts/posts.json', JSON.stringify(posts, null, 2));