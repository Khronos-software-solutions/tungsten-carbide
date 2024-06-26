/* This module fetches a post from Stack Overflow and displays it and its answers.
   See ../post/script.js for a more in depth explanation.
*/
let id = getCookie('nextstackpost')
$.getJSON(`https://api.stackexchange.com/2.3/questions/${id}?order=desc&sort=activity&site=stackoverflow&filter=!17mFf6QJCBuWGviRfnMOWJNa59mYvy-)WzUjaCMd(Nb_1e`,
  function (data) {
    post = data.items[0]
    if (data == undefined) {
      window.location = '../4xx'
      return
    }

    const postBody = document.getElementById('postbody')
    let s = 'neut'
    if (post.score > 0) {
      s = 'pos'
    } else if (post.score < 0) {
      s = 'neg'
    }
    postBody.innerHTML = postBody.innerHTML + `
      <div style="display: flex;">
        <div class="postscore postscore-${s}">${post.score}</div>
        <div class="post">
          <h1>${post.title}</h1><br>
          ${post.body}
        </div>
      </div>`

    const answerHeader = document.getElementById('answer-header')

    const answers = document.getElementById('answers')
    if (post.answers && post.answers.length != 0) {
      if (post.answers.length == 1) {
        answerHeader.innerHTML = '1 Answer'
      } else {
        answerHeader.innerHTML = `${post.answers.length} Answers`
      }
      post.answers.forEach(e => {
        let s = 'neut'
        if (e.score > 0) {
          s = 'pos'
        } else if (e.score < 0) {
          s = 'neg'
        }
        answers.innerHTML = answers.innerHTML + `
          <div class="post" style="display: flex;">
            <div class="postscore postscore-${s}">${e.score}</div>
            <div>${e.body}</div>
          </div><br>`
      })
    } else {
      answerHeader.innerHTML = 'No Answers'
    }
    hljs.highlightAll()
    setDarkMode()
  }
)
