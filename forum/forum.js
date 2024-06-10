import posts from '../pages.js'

let pagelist =  document.getElementById('page-list')

posts.posts.forEach(element => {
    let s = 'neut'
    if (element.score > 0) {
        s = 'pos'
    } else if (element.score < 0) {
        s = 'neg'
    }

    let tagelements = 'no tags'

    if (element.hasOwnProperty("tags") && element.tags.length != 0) {
        tagelements = ''
        element.tags.forEach(tag => {tagelements += `<div class="tag">${tag}</div>&nbsp;`})
    }
    
    pagelist.innerHTML = pagelist.innerHTML + `\n
    <div class="pagelist-element">
        <div class="upper">
            <div class="pagelist-title">${element.title}</div>&nbsp;·&nbsp;<div class="pagescore-${s}">${element.score}</div>&nbsp;·&nbsp;<div class="tag-container">${tagelements}</div></div><br>
        <div class="lower">
            <div class="pagelist-subtitle">${element.body.slice(0,50)}...</div>
        </div>
    </div>`
});
