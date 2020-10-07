const fs = require('fs');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const path = require('path');

function stripHtml(html, replaceDoubleSpaceWith) {
    replaceDoubleSpaceWith = replaceDoubleSpaceWith || '';
    return html.textContent.replace(/(\r\n|\n|\r)/gm, '').replace(/\s+/g, replaceDoubleSpaceWith);
}

function removeDirectory(directory, removeSelf) {
    if (removeSelf === undefined) removeSelf = true;
    try {
        const files = fs.readdirSync(directory) || [];
        files.forEach(file => {
            const filePath = path.join(directory, file);
            if (fs.statSync(filePath).isFile())
                fs.unlinkSync(filePath);
            else
                removeDirectory(filePath);
        })
    } catch (e) {
        return;
    }
    if (removeSelf)
        fs.rmdirSync(directory);
}

function setMetaContent(rootElement, selector, content) {
    [...rootElement.getElementsByClassName(selector)].forEach(element => {
        if (content) element.setAttribute("content", content);
        else rootElement.getElementsByTagName('head')[0].removeChild(element);
    });
}


//remove old stuff
removeDirectory('./posts', false);

const posts = fs
    .readdirSync('./post_partials')
    .filter(file => path.extname(file).toLowerCase() === '.html')

//create meta info
let postsMeta = [];

//create post files
//read post template
const postTemplate = fs.readFileSync(`./post-template.html`, 'utf8');
posts.forEach(file => {
    const newPageDocument = new JSDOM(postTemplate).window.document;
    const html = fs.readFileSync(`./post_partials/${file}`, 'utf8');
    const article = new JSDOM(html).window.document.querySelector('article');
    newPageDocument.getElementById('post-inner').innerHTML = article.innerHTML;

    const metaTag = new JSDOM(html).window.document.querySelector('post-meta');
    let hasMeta = metaTag && stripHtml(metaTag) !== '';

    // strip html tags, line breaks and extra spaces
    const articleBody = stripHtml(article, ' ');

    let baseMeta = {
        file: file,
        title: file.replace(path.extname(file), ''),
        body: articleBody,
        "postDate": fs.statSync(`./post_partials/${file}`).mtime
    };

    if (!hasMeta) {
        postsMeta.push(baseMeta);
    } else {
        const postMeta = JSON.parse(metaTag.textContent);

        newPageDocument.title = postMeta.title;
        if (postMeta.thumbnail) {
            newPageDocument.getElementById('post-thumbnail').innerHTML = `<img src="/img/${postMeta.thumbnail}" alt="" class="img-fluid"/>`;
            setMetaContent(newPageDocument, 'metaImage', `/img/${postMeta.thumbnail}`);
        } else {
            newPageDocument.getElementById('post-thumbnail').innerHTML = '';
            setMetaContent(newPageDocument, 'metaImage', '');
        }
        /*const shareWidget = document.getElementsByClassName('share-post-widget')[0];
        shareWidget.getElementsByClassName('facebook')[0].href = `https://www.facebook.com/sharer/sharer.php?u=${location.href}`;
        shareWidget.getElementsByClassName('twitter')[0].href = `https://twitter.com/intent/tweet?text=CHeck out this blog post from @Eonasdan. ${location.href}`;
        shareWidget.getElementsByClassName('linkedin')[0].href = `https://www.linkedin.com/sharing/share-offsite/?url=${location.href}`;*/

        setMetaContent(newPageDocument, 'metaTitle', postMeta.title);
        setMetaContent(newPageDocument, 'metaDescription', postMeta.excerpt);
        setMetaContent(newPageDocument, 'metaUrl', `https://eonasdan.com/posts/${file}`);
        setMetaContent(newPageDocument, 'metaPublishedTime', new Date(postMeta.postDate).toISOString());
        //todo could use the fs.state to get the modified time, but I'd rather have control over that
        if (!postMeta.updateDate) postMeta.updateDate = postMeta.postDate;
        setMetaContent(newPageDocument, 'metaModifiedTime', new Date(postMeta.updateDate).toISOString());

        setMetaContent(newPageDocument, 'metaTag', postMeta.tags);

        postsMeta.push({
            ...baseMeta,
            ...postMeta
        });
    }

    fs.writeFileSync(`./posts/${file}`,
        `<!DOCTYPE html>
<html lang="en">${newPageDocument.getElementsByTagName('html')[0].innerHTML}
</html>`);
});


postsMeta = postsMeta
    .sort((a, b) => {
        return +new Date(a.postDate) > +new Date(b.postDate) ? -1 : 0;
    });

fs.writeFileSync('./posts/posts.json', JSON.stringify(postsMeta, null, 2));
