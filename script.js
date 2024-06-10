const setCookie = (n, v, ds) => {
    var e = ''
    if (ds) {
        var d = new Date()
        d.setTime(d.getTime() + (ds*24*60*60*1000))
        e = `;expires=${d.toUTCString()}` // Expiration date
    }
    document.cookie = `${n}=${(v||'')}${e};path=/;`
}

const getCookie = (n) => {
    var nEQ = `${n}=`;
    var ca = document.cookie.split(';')
    for(var i=0;i < ca.length;i++) {
        var c = ca[i]
        while (c.charAt(0)==' ') c = c.substring(1,c.length)
        if (c.indexOf(nEQ) == 0) return c.substring(nEQ.length,c.length)
    }
    return null;
}

const setDarkMode = () => {
    if (getCookie('darkmode') !== 'false') {
        document.querySelectorAll('*').forEach(e => {e.classList.add('dark')}) // Add 'dark' class to all elements
    } else {
        document.querySelectorAll('*').forEach(e => {e.classList.contains('dark') ? e.classList.remove('dark') : null}) // Remove 'dark' class from every element that have one
    }
} 
