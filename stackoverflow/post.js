() => {
    let id = getCookie('nextpost')
    $.getJSON(`https://api.stackexchange.com/2.3/questions/${id}?order=desc&sort=activity&site=stackoverflow&filter=!6WPIomnMOOD*e`, data,
        function (data) {
            
        }
    );
}