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

class DarkModeToggle extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }
    connectedCallback() {
        const button = document.createElement('button')
        button.addEventListener('click', () => {
            if (getCookie('darkmode') !== 'false') {
                setCookie('darkmode', 'false')
            } else {
                setCookie('darkmode', 'true')
            }
            setDarkMode()
        })
        const icon = document.createElement('span')
        icon.classList.add('fa-solid')
        icon.classList.add('fa-sun-o')
        if (getCookie('darkmode') !== 'false') {
            icon.classList.remove('fa-sun-o')
            icon.classList.add('fa-moon-o')
        } else {
            icon.classList.add('fa-sun-o')
            icon.classList.remove('fa-moon-o')
        }
        button.appendChild(icon)
        this.shadowRoot.appendChild(button)
    }
}

customElements.define('darkmode-toggle', DarkModeToggle)

window.onload = () => {
    setDarkMode()
}
