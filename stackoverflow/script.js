/* This module fetches posts from Stack Overflow and lists them */

$.getJSON("https://api.stackexchange.com/2.3/questions?order=desc&max=25&sort=votes&site=stackoverflow&filter=!*Mg4PjfgUekbVKYa",
  function (data) {
    let items = []
    $.each(data.items, function (key, val) {
      let s = 'neut'
      if (val.score > 0) {
        s = 'pos'
      } else if (val.score < 0) {
        s = 'neg'
      }

      let tags = 'No tags'
      let answerCount = 'No answers'

      if (!val.hasOwnProperty('title')) {
        val.title = 'Untitled Post'
      }

      if (!val.hasOwnProperty('body')) {
        val.body = ''
      }

      if (val.answers) {
        if (val.answers.length == 1) {
          answerCount = `1 answer`
        } else if (val.answers.length > 1) {
          answerCount = `${val.answers.length} answers`
        }
      }

      if (val.hasOwnProperty('tags') && val.tags.length != 0) {
        tags = ''
        val.tags.forEach(tag => { tags += `<div class="tag">${tag}</div>&nbsp;` })
      }

      items.push(`<div class="pagelist-element" onclick="goToStackPost(${val.question_id})">
<div class="upper"><div class="pagelist-title">${val.title}</div>&nbsp;·&nbsp;<div class="pagescore pagescore-${s}">${val.score}</div>&nbsp;·&nbsp;<div class="answercount">${answerCount}</div>&nbsp;·&nbsp;<div class="tag-container">${tags}</div></div><br>
<div class="lower"><div class="pagelist-subtitle">${val.body.replace(/<[^>]*>?/gm, '').slice(0, 50)}...</div></div>
</div>`)
    })
    items.forEach(e => {
      $('#main').append(e)
    })
    setDarkMode()
  }
)


const goToStackPost = (id) => {
  setCookie('nextstackpost', id)
  window.location = "./post/"
}