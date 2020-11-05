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
                                    <a href="/posts/${post.file}" class="post-title mb-2">${post.title}</a>
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

const urlParams = new URLSearchParams(window.location.search);
const term = urlParams.get('search');
if (term) {
    fetch('/posts/posts.json')
        .then(response => response.json())
        .then(data => {
            showPosts(data.filter(x => x.title.includes(term) || x.body.includes(term)));
        });
}


function onLinkClick(e) {
    window.location.href = e.target.href;
}

[...document.querySelectorAll('.vizew-pager .post-title')].forEach(element => element.addEventListener('click', onLinkClick));