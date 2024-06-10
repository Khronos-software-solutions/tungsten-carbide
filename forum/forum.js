import posts from '../pages.js'

let pagelist =  document.getElementById('page-list')

posts.posts.forEach(element => {
    pagelist.innerHTML = pagelist.innerHTML + `\n<h3>${element.title}</h3>`
});
