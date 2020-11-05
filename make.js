const fs = require('fs');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const path = require('path');
const minify = require('html-minifier').minify;

const rootSite = 'https://eonasdan.com';

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

// since everyone has to have their own meta data *rolls eyes* the primary purpose here
// is to quickly find similar tags and set them all at once
function setMetaContent(rootElement, selector, content) {
    [...rootElement.getElementsByClassName(selector)].forEach(element => {
        if (content) {
            element.setAttribute("content", content);
            element.removeAttribute("class");
        } else rootElement.getElementsByTagName('head')[0].removeChild(element);
    });
}

// doing this as a function so I don't have to null check values inline
function setStructuredData(structure, property, value) {
    if (!value) return;

    structure[property] = value;
}

//read shell template
const shellTemplate = fs.readFileSync(`./templates/shell-template.html`, 'utf8');

//remove old stuff
removeDirectory('./posts', false);

const posts = fs
    .readdirSync('./post_partials')
    .filter(file => path.extname(file).toLowerCase() === '.html')

//create meta info
let postsMeta = [];

//prepare the static homepage text
//todo at some point we'll have to deal with paging or infinite scrolls or something
let homePageHtml = '';

//create post files
//read post template
const postTemplate = fs.readFileSync(`./templates/post-template.html`, 'utf8');

//for each post partial, we create a full html page
posts.forEach(file => {
    const newPageDocument = new JSDOM(postTemplate).window.document;
    const html = fs.readFileSync(`./post_partials/${file}`, 'utf8');
    const article = new JSDOM(html).window.document.querySelector('article');
    newPageDocument.getElementById('post-inner').innerHTML = article.innerHTML;

    const metaTag = new JSDOM(html).window.document.querySelector('post-meta');
    let hasMeta = metaTag && stripHtml(metaTag) !== '';

    // strip html tags, line breaks and extra spaces
    const articleBody = stripHtml(article, ' ');

    let postMeta = {
        file: file,
        title: file.replace(path.extname(file), ''),
        body: articleBody,
        postDate: fs.statSync(`./post_partials/${file}`).mtime
    };

    if (!hasMeta) {
        postsMeta.push(postMeta);
    } else {

        postMeta = {
            ...postMeta,
            ...JSON.parse(metaTag.textContent)
        }

        // create structured data
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "author": {
                "@type": "Person",
                "name": "Jonathan Peterson",
                "url": "https://eonasdan.com"
            },
        };

        newPageDocument.title = postMeta.title;
        if (postMeta.thumbnail) {
            newPageDocument.getElementById('post-thumbnail').innerHTML = `<img src="/img/${postMeta.thumbnail}" alt="" class="img-fluid"/>`;
            const fullyQualifiedImage = `${rootSite}/img/${postMeta.thumbnail}`;
            setMetaContent(newPageDocument, 'metaImage', fullyQualifiedImage);
            setStructuredData(structuredData, 'image', [
                fullyQualifiedImage
                ]);
        } else {
            newPageDocument.getElementById('post-thumbnail').innerHTML = '';
            setMetaContent(newPageDocument, 'metaImage', '');
        }
        /*const shareWidget = document.getElementsByClassName('share-post-widget')[0];
        shareWidget.getElementsByClassName('facebook')[0].href = `https://www.facebook.com/sharer/sharer.php?u=${location.href}`;
        shareWidget.getElementsByClassName('twitter')[0].href = `https://twitter.com/intent/tweet?text=CHeck out this blog post from @Eonasdan. ${location.href}`;
        shareWidget.getElementsByClassName('linkedin')[0].href = `https://www.linkedin.com/sharing/share-offsite/?url=${location.href}`;*/

        setMetaContent(newPageDocument, 'metaTitle', postMeta.title);
        setStructuredData(structuredData, 'headline', postMeta.title);

        setMetaContent(newPageDocument, 'metaDescription', postMeta.excerpt);
        const fullyQualifiedUrl = `${rootSite}/posts/${file}`;
        setMetaContent(newPageDocument, 'metaUrl', fullyQualifiedUrl);
        setStructuredData(structuredData, 'mainEntityOfPage', fullyQualifiedUrl);

        const publishDate = new Date(postMeta.postDate).toISOString();
        setMetaContent(newPageDocument, 'metaPublishedTime', publishDate);
        setStructuredData(structuredData, 'datePublished', publishDate);

        //todo could use the fs.state to get the modified time, but I'd rather have control over that
        if (!postMeta.updateDate) postMeta.updateDate = postMeta.postDate;
        const updateDate = new Date(postMeta.updateDate).toISOString();
        setMetaContent(newPageDocument, 'metaModifiedTime', updateDate);
        setStructuredData(structuredData, 'dateModified', updateDate);

        setMetaContent(newPageDocument, 'metaTag', postMeta.tags);
        setStructuredData(structuredData, 'keywords', postMeta.tags.split(', '));

        postsMeta.push(postMeta);

        // push structured data to body
        const structuredDataTag = newPageDocument.createElement("script");
        structuredDataTag.type = "application/ld+json";
        structuredDataTag.innerHTML = JSON.stringify(structuredData, null, 2);
        newPageDocument.getElementsByTagName("body")[0].appendChild(structuredDataTag);
    }

    const minifiedBody = minify(newPageDocument.getElementsByTagName('html')[0].innerHTML, {
        //collapseWhitespace: true,
        removeComments: true
    });

    fs.writeFileSync(`./posts/${file}`,
        `<!DOCTYPE html>
<html lang="en">${minifiedBody}
</html>`);

    //add to homepage html
    homePageHtml += `<div class="single-post-area style-2">
                        <div class="row align-items-center">
                            <div class="col-12 col-md-6">
                                <div class="post-thumbnail">
                                    <img src="/img/${postMeta.thumbnail}" alt="" class="img-fluid"/>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="post-content mt-0">
                                    <a href="/posts/${postMeta.file}" class="post-title mb-2">${postMeta.title}</a>
                                    <div class="post-meta d-flex align-items-center mb-2">
                                        <span class="post-author">By Jonathan Peterson</span>
                                        <i class="far fa-circle" aria-hidden="true"></i>
                                        <span class="post-date">${postMeta.postDate}</span>
                                    </div>
                                    <p class="mb-2">${postMeta.excerpt}</p>
                                </div>
                            </div>
                        </div>
                    </div>`
});

postsMeta = postsMeta
    .sort((a, b) => {
        return +new Date(a.postDate) > +new Date(b.postDate) ? -1 : 0;
    });

fs.writeFileSync('./posts/posts.json', JSON.stringify(postsMeta, null, 2));

//set home page html
(function() {
    const indexDocument = new JSDOM(fs.readFileSync(`./templates/index.html`, 'utf8')).window.document;
    indexDocument.getElementById('post-container').innerHTML = homePageHtml;
    const minifiedBody = minify(indexDocument.getElementsByTagName('html')[0].innerHTML, {
        collapseWhitespace: true,
        removeComments: true
    });

    fs.writeFileSync(`./index.html`,
        `<!DOCTYPE html>
<html lang="en">${minifiedBody}
</html>`);
})();