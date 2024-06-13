import posts from "../posts.mjs"

window.onload = () => {
  let postId = getCookie('nextpost')
  let post = posts.posts.find(e => e.post_id == postId)

  if (post == undefined) {
    window.location = '../4xx'
    return
  }

  document.getElementById('postbody').innerHTML = post.body
}