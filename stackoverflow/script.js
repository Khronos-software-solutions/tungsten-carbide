$.getJSON("https://api.stackexchange.com/2.3/posts?order=desc&sort=votes&site=stackoverflow&filter=!T3AudpfhnFxP(y7gWl",
    function (data) {
        let items = []
        $.each(data.items, function (key, val) { 
            let s = 'neut'
            if (val.score > 0) {
                s = 'pos'
            } else if (val.score < 0) {
                s = 'neg'
            }

            let tagvals = 'No tags'
            let answercount = 'No answers'

            if (!val.hasOwnProperty('title')) {
                val.title = 'Untitled Post'
            }

            if (!val.hasOwnProperty('body')) {
                val.body = ''
            }

            if (val.answers) {
                if (val.answers.length == 1) {
                    answercount = `1 answer`
                } else if (val.answers.length > 1) {
                    answercount = `${val.answers.length} answers`
                }
            }

            if (val.hasOwnProperty('tags') && val.tags.length != 0) {
                tagvals = ''
                val.tags.forEach(tag => {tagvals += `<div class="tag">${tag}</div>&nbsp;`})
            }

            items.push(`<div class="pagelist-element" onclick="goToPost(${val.post_id})">
<div class="upper"><div class="pagelist-title">${val.title}</div>&nbsp;·&nbsp;<div class="pagescore pagescore-${s}">${val.score}</div>&nbsp;·&nbsp;<div class="answercount">${answercount}</div>&nbsp;·&nbsp;<div class="tag-container">${tagvals}</div></div><br>
<div class="lower"><div class="pagelist-subtitle">${val.body.replace(/<[^>]*>?/gm, '').slice(0,50)}...</div></div>
</div>`)
        })
        console.log(items)
        items.forEach(e => {
              $('#main').append(e);
        });
    }
)

const goToPost = (id) => {
    setCookie('nextpost', id)
    console.error('Error: lack of progress -_-')
}