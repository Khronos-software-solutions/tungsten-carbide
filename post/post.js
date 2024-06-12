import posts from "../pages.js"

const findGetParameter = (parameterName) => {
  let result = null
  location.search
    .substring(1)
    .split("&")
    .forEach(function (item) {
      if (item.split("=")[0] === parameterName) result = decodeURIComponent(item.split("=")[1]);
    });
  return result;
}

window.findGetParameter = findGetParameter

window.onload = () => {
  if (typeof (findGetParameter('id')) != ('number' || 'string')) {
    console.log('invalid')
  }

  const post_id = findGetParameter('id')

  if (posts.posts.find(element => element.post_id == post_id) == undefined) {
    console.log('not found')
  }

}