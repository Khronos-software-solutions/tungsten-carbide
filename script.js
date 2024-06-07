const getCookie = (name) => {
    let c = document.cookie.split(';')
    let i = c.findIndex(_ => _.includes(`${name}=`))
    if (i !== -1) {
        return c[i].slice(c[i].indexOf('=') + 1)
    } else {
        console.warn('cookie does not exist')
        return 'error'
    }
}

const setCookie = (name, data) => {
    let c = document.cookie.split(';')
    
    let i = c.findIndex(_ => _.includes(`${name}=`))
    if (i !== -1) {
        c[i] = `${name}=${data}`
        console.log(c.join(';'))
        document.cookie = c.join(';')
    } else {
        c.concat(`${name}=${data}`)
        console.log(c.join(';'))
        document.cookie = c.join(';')
    }
}

document.cookie = 'init=true;hallo=mongool;waarom=kijk;je=naar;de=cookies'
