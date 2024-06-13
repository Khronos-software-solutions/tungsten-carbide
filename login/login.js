async function sha256(str) {
    const buffer = new TextEncoder('utf-8').encode(str)
    await crypto.subtle.digest('SHA-256',buffer)
    const hex = new Uint8Array(buffer).map(b => ('00' + b.toString(16)).slice(-2)).join('')
    return hex
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

const login = async () => {
    const form = document.getElementById('loginform')
    const {username, password} = form.elements
    // authorization goes here...
    // rejection handling also

    let exp = Date.now()
    exp = exp.addDays(5)

    setCookie('username', username.value)
    setCookie('sessionToken', await sha256(username.value) + await sha256(password.value) + await sha256(exp), 5) // the session token is just a combination of the digested username, password and expiration date
}

const register = async () => {
    const form = document.getElementById('registerform')
    const { firstname, lastname, email, username, password, confirmpassword } = form.elements
    let now = Date.now()
    if (!(password.value === confirmpassword.value)) {
        window.alert('Passwords are not the same!')
    }
    console.log('It is currently impossible to save something to a file. This is what is supposed to be appended to users.csv:')
    console.log(`someId,${firstname.value + " " + lastname.value},${username.value},${email.value},${now.toString()},member,${await sha256(password.value)}`)
    
}