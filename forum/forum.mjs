import posts from '../posts.mjs'

let pagelist =  document.getElementById('page-list')

const updatePosts = (term) => {
    String.prototype.includesSubstr = function (arr) {
        if (this === null || this === undefined) {
            console.error('Cannot call containsSubstring on null or undefined');
            return true
        }
        let sample = this.toString().toLowerCase()
        arr = arr.map(e => e.toLowerCase())
        return arr.some(substr => sample.includes(substr))
    }

    pagelist.innerHTML = ''

    posts.posts.forEach(element => {

        if (!(element.body.includesSubstr(term.split(' ')) || element.title.includesSubstr(term.split(' ')))) {
            return
        }

        let s = 'neut'
        if (element.score > 0) {
            s = 'pos'
        } else if (element.score < 0) {
            s = 'neg'
        }

        let tagelements = 'No tags'
        let answercount = 'No answers'

        if (!element.hasOwnProperty('title')) {
            element.title = 'Untitled Post'
        }

        if (!element.hasOwnProperty('body')) {
            element.body = ''
        }

        if (element.answers) {
            if (element.answers.length == 1) {
                answercount = `1 answer`
            } else if (element.answers.length > 1) {
                answercount = `${element.answers.length} answers`
            }
        }

        if (element.hasOwnProperty('tags') && element.tags.length != 0) {
            tagelements = ''
            element.tags.forEach(tag => {tagelements += `<div class="tag">${tag}</div>&nbsp;`})
        }

        pagelist.innerHTML = pagelist.innerHTML + `\n
        <div class="pagelist-element" onclick="goToPost(${element.post_id})">
            <div class="upper">
                <div class="pagelist-title">${element.title}</div>&nbsp;·&nbsp;<div class="pagescore pagescore-${s}">${element.score}</div>&nbsp;·&nbsp;<div class="answercount">${answercount}</div>&nbsp;·&nbsp;<div class="tag-container">${tagelements}</div></div><br>
            <div class="lower">
                <div class="pagelist-subtitle">${element.body.slice(0,50)}...</div>
            </div>
        </div>`
    });
    setDarkMode()
}

const submit = (event) => {
    if (event == null || event.keyCode == 13) {
        let s = document.getElementById('searchbar')
        updatePosts(s.value)
    }
}

updatePosts('')

window.submit = submit