function loadPage(url) {
    let page = url === '/' ? 'home' : url.slice(1);
    fetch(`/partial/${page}`)
        .then(res => res.text())
        .then(html => {
            document.getElementById('main-content').innerHTML = html;
        })
        .catch(() => {
            document.getElementById('main-content').innerHTML = '<h2>404 - Not found</h2>';
        });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
        });
    });

    loadPage(location.pathname);
});


function changeURL(url) {
    window.location.pathname = url;
}