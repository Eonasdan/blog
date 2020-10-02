const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const details = (file) => ({
    size: fs.readFileSync(`./posts/${file}`).length,
    mtime: fs.statSync(`./posts/${file}`).mtime,
});

fs.readFile(`./test1.html`, 'utf8', function (error, html) {
    console.log('here')
    if (error) {
        throw error;
    }
    const dom = new JSDOM(html);
    const a = dom.window.document.querySelector("post-meta").textContent;
    var b = JSON.parse(a);
    console.log(html)
});

const posts = fs
    .readdirSync('./posts')
    .reduce((a, b) => {
        return ({...a, [b.replace('.md', '')]: details(b)});
    }, {});

fs.writeFileSync('./posts.json', JSON.stringify(posts));