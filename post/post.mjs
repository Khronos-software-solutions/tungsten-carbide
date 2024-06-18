import posts from "../posts.mjs"

window.onload = () => {
  let postId = getCookie('nextpost')
  let post = posts.posts.find(e => e.post_id == postId)

  if (post == undefined) {
    window.location = '../4xx'
    return
  }

  const postbody = document.getElementById('postbody')
  let scorecolor = 'neut'
  if (post.score > 0) {
    scorecolor = 'pos'
  }  else if (e.post < 0) {
    scorecolor = 'neg'
  } 
  postbody.innerHTML = postbody.innerHTML + `
  <div style="display: flex;">
    <div class="postscore postscore-${scorecolor}">${post.score}</div>
    <div class="post">
      <h1>${post.title}</h1><br>
      ${post.body}
    </div>
  </div>`

  const answerheader = document.getElementById('answer-header')

  const answers = document.getElementById('answers')
  if (post.answers && post.answers.length != 0) {
    if (post.answers.length == 1) {
      answerheader.innerHTML = '1 Answer'
    } else {
      answerheader.innerHTML = `${post.answers.length} Answers`
    }
    post.answers.forEach(e => {
      let scorecolor = 'neut'
      if (e.score > 0) {
        scorecolor = 'pos'
      }  else if (e.score < 0) {
        scorecolor = 'neg'
      } 
      answers.innerHTML = answers.innerHTML + `<div style="display: flex;"><div class="postscore postscore-${scorecolor}">${e.score}</div><div class="post">${e.body}</div></div><br>`
    })
  } else {
    answerheader.innerHTML = 'No Answers'
  }
  hljs.highlightAll()
  setDarkMode()
}