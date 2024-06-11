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

window.onload = () => {
    if (typeof(findGetParameter('id')) != ('number' || 'string')) {
        window.location.replace('../404.html')
    }

    const post_id = findGetParameter('id')

    if(posts.posts.find(element => element.post_id == post_id) == undefined) {
        window.location.replace('../404.html')
    }

}