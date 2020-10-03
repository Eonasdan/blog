let posts = [];

function noPost() {
    document.getElementById('post-container').innerHTML = "<h1>There's no post here.</h1>";
    document.getElementById('previousPager').style.display = 'none';
    document.getElementById('nextPager').style.display = 'none';
}

function onLinkClick(e) {
    e.preventDefault();
    const file = e.target.dataset.file;
    getPost(file);
    window.history.pushState(null, null, file);
}

function getPost(file) {
    fetch(`./posts/${file}.html`)
        .then(response => {
            if (!response.ok) {
                noPost();
                throw new Error('No post found');
            }
            return response.text();
        })
        .then(function (html) {
            const doc = new DOMParser().parseFromString(html, "text/html");
            document.getElementById('post-inner').innerHTML = doc.querySelector('article').innerHTML;
            //document.head.innerHTML += doc.querySelector('post-head').innerHTML;

            const post = posts.find(x => x.file === file);
            let postDate = new Date();
            if (post) {
                document.title = post.title;
                if (post.thumbnail) {
                    document.getElementById('post-thumbnail').innerHTML = `<img src="/img/${post.thumbnail}" alt="" class="img-fluid"/>`;
                    document.getElementById('metaImage').setAttribute("content", `//${location.host}/img/${post.thumbnail}`);
                } else {
                    document.getElementById('post-thumbnail').innerHTML = '';
                }
                if (post.postDate) postDate = new Date(post.postDate);
                /*const shareWidget = document.getElementsByClassName('share-post-widget')[0];
                shareWidget.getElementsByClassName('facebook')[0].href = `https://www.facebook.com/sharer/sharer.php?u=${location.href}`;
                shareWidget.getElementsByClassName('twitter')[0].href = `https://twitter.com/intent/tweet?text=CHeck out this blog post from @Eonasdan. ${location.href}`;
                shareWidget.getElementsByClassName('linkedin')[0].href = `https://www.linkedin.com/sharing/share-offsite/?url=${location.href}`;*/

                document.getElementById('metaTitle').setAttribute("content", post.title);
                document.getElementById('metaDescription').setAttribute("content", post.excerpt);
                document.getElementById('metaUrl').setAttribute("content", location.href);
            }

            function updatePager(selector, post) {
                if (post.thumbnail) {
                    selector.getElementsByClassName('single-feature-post')[0].style.backgroundImage = `url(/img/${post.thumbnail})`;
                } else {
                    selector.getElementsByClassName('single-feature-post')[0].style.backgroundImage = '';
                }
                selector.getElementsByClassName('post-title')[0].innerHTML = post.title;
                selector.getElementsByClassName('post-title')[0].dataset.file = post.file;

                /* if (post.excerpt) {
                     selector.getElementsByClassName('post-excerpt')[0].innerHTML = post.excerpt;
                 }*/
                selector.style.display = 'block'
            }

            const index = posts.findIndex(x => x === post);
            const pastPost = posts[index + 1];
            const futurePost = posts[index - 1];

            if (pastPost) updatePager(document.getElementById('previousPager'), pastPost);
            else document.getElementById('previousPager').style.display = 'none';

            if (futurePost) updatePager(document.getElementById('nextPager'), futurePost);
            else document.getElementById('nextPager').style.display = 'none';
        });
}

function showPosts(filteredPosts) {
    let html = ''
    if (!filteredPosts || filteredPosts.length === 0) html = '<h1>No results</h1>';
    filteredPosts.forEach(post => {
        html += `<div class="single-post-area style-2">
                        <div class="row align-items-center">
                            <div class="col-12 col-md-6">
                                <div class="post-thumbnail">
                                    <img src="/img/${post.thumbnail}" alt="" class="img-fluid"/>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="post-content mt-0">
                                    <a href="/${post.file}" class="post-title mb-2">${post.title}</a>
                                    <div class="post-meta d-flex align-items-center mb-2">
                                        <span class="post-author">By Jonathan Peterson</span>
                                        <i class="far fa-circle" aria-hidden="true"></i>
                                        <span class="post-date">${post.postDate}</span>
                                    </div>
                                    <p class="mb-2">${post.excerpt}</p>
                                </div>
                            </div>
                        </div>
                    </div>`;
    });
    document.getElementById('post-container').innerHTML = html;
}

function search(term) {
    if (!term) return;
    showPosts(posts.filter(x => x.title.includes(term) || x.body.includes(term)));
}

fetch('./posts/posts.json')
    .then(response => response.json())
    .then(data => {
        posts = data;
        const urlParams = new URLSearchParams(window.location.search);
        const term = urlParams.get('search');
        if (term) {
            search(term)
        } else if (redirect) {
            getPost(location.pathname.substring(1));
        } else if (location.pathname === '/') {
            showPosts(posts);
        } else {
            noPost();
        }
    });
//vizew-pager
[...document.querySelectorAll('.single-feature-post .post-title')].forEach(element => element.addEventListener('click', onLinkClick));