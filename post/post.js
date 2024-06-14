import posts from "../posts.mjs"

window.onload = () => {
  let postId = getCookie('nextpost')
  let post = posts.posts.find(e => e.post_id == postId)

  if (post == undefined) {
    window.location = '../4xx'
    return
  }

  const postbody = document.getElementById('postbody')
  postbody.innerHTML = postbody.innerHTML + `<h1>${post.title}</h1><br>${post.body}`

  const answers = document.getElementById('answers')
  if (post.answers && post.answers.length != 0) {
    post.answers.forEach(e => {
      answers.innerHTML = answers.innerHTML + e.body
    })
  } else {
    answers.innerHTML = "<h3>No answers</h3>"
  }
  hljs.highlightAll()
  setDarkMode()
}