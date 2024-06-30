/* 
  This module is for loading forum posts from `posts.mjs` and listing them with their tags, scores, answer counts and partial body
*/

import posts from '../posts.mjs'

let pageList = document.getElementById('page-list')

const updatePosts = (term) => {

  // For searching; will search within title, body and tags
  String.prototype.includesSubstr = function (arr) {
    if (this === null || this === undefined) {
      console.error('Cannot call containsSubstring on null or undefined')
      return true
    }
    let sample = this.toString().toLowerCase()
    arr = arr.map(e => e.toLowerCase())
    return arr.some(substr => sample.includes(substr))
  }

  // Initial innerHTML
  pageList.innerHTML = ''

  // Iterate over every post and add it to the list
  posts.posts.forEach(element => {
    let tags = 'No tags'
    let answerCount = 'No answers'

    if (!(element.body.includesSubstr(term.split(' ')) || element.title.includesSubstr(term.split(' ')))) {
      return
    }

    // Coloring the scores
    let s = 'neut'
    if (element.score > 0) {
      s = 'pos'
    } else if (element.score < 0) {
      s = 'neg'
    }

    // Use placeholders if necessary
    if (!element.hasOwnProperty('title')) {
      element.title = 'Untitled Post'
    }
    if (!element.hasOwnProperty('body')) {
      element.body = ''
    }

    // Showing counts
    if (element.answers) {
      if (element.answers.length == 1) {
        answerCount = `1 answer`
      } else if (element.answers.length > 1) {
        answerCount = `${element.answers.length} answers`
      }
    }

    // Tags
    if (element.hasOwnProperty('tags') && element.tags.length != 0) {
      tags = ''
      element.tags.forEach(tag => { tags += `<div class="tag">${tag}</div>&nbsp;` })
    }

    pageList.innerHTML = pageList.innerHTML + `\n
        <div class="pagelist-element" onclick="goToPost(${element.post_id})">
            <div class="upper">
                <div class="pagelist-title">${element.title}</div>&nbsp;·&nbsp;<div class="pagescore pagescore-${s}">${element.score}</div>&nbsp;·&nbsp;<div class="answercount">${answerCount}</div>&nbsp;·&nbsp;<div class="tag-container">${tags}</div></div><br>
            <div class="lower">
                <div class="pagelist-subtitle">${element.body.slice(0, 50)}...</div>
            </div>
        </div>`
  })

  setDarkMode()
}


const submit = (event) => {
  // Only update when pressing enter
  if (event == null || event.keyCode == 13) {
    let s = document.getElementById('searchbar')
    updatePosts(s.value)
  }
}

// List all posts on load
window.onload = () => {
  updatePosts('')
  document.addEventListener("keypress", submit)
}
