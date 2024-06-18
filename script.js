const setCookie = (n, v, ds) => {
  var e = ''
  if (ds) {
    var d = new Date()
    d.setTime(d.getTime() + (ds * 24 * 60 * 60 * 1000))
    e = `;expires=${d.toUTCString()}` // Expiration date
  }
  document.cookie = `${n}=${(v || '')}${e};path=/;`
}

const getCookie = (n) => {
  var nEQ = `${n}=`
  var ca = document.cookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) == ' ') c = c.substring(1, c.length)
    if (c.indexOf(nEQ) == 0) return c.substring(nEQ.length, c.length)
  }
  return null
}

const deleteCookie = (n) => {
  if( getCookie(n) ) {
    document.cookie = n + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;SameSite=None"
  }
}

const setDarkMode = () => {
  if (window.localStorage.getItem('darkmode') !== 'false') {
    document.body.classList.add('dark')
    document.body.querySelectorAll('*').forEach(e => { e.classList.add('dark') }) // Add 'dark' class to all elements
  } else {
    document.body.classList.remove('dark')
    document.body.querySelectorAll('*').forEach(e => { e.classList.contains('dark') ? e.classList.remove('dark') : null }) // Remove 'dark' class from every element that hasx` one
  }
}

const updateButton = () => {
  const t = document.getElementById('theme-icon')
  if (t == null) {return}
  if (window.localStorage.getItem('darkmode') != 'false') {
    window.localStorage.setItem('darkmode', 'false')
    setDarkMode()
    t.classList.remove('icon-theme-dark')
    t.classList.add('icon-theme-light')
  } else {
    window.localStorage.setItem('darkmode', 'true')
    setDarkMode()
    t.classList.remove('icon-theme-light')
    t.classList.add('icon-theme-dark')
  }
}

const goToPost = (id) => {
  setCookie('nextpost', id)
  window.location = '../post/'
}

window.onload = () => {
  setDarkMode()
  updateButton()
  updateButton()
}
