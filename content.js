let currentSubject = '';
let blockList;

let textArr = [];
let divisions = document.getElementsByTagName('div');
for (div of divisions) {
    textArr.push(div.innerText);
}
const TEXT_STR = textArr.join(' ').replaceAll('\n', ' ');
const HTTP = new XMLHttpRequest();
const API_URL = 'https://concentration-server.herokuapp.com/api/summary';

function checkSubject() {
    chrome.storage.sync.get({
        'blist': [], 'mode': 'strict',
        'limitReached': false, 'reachedDate': 0
    }, function (obj) {
        let limitReached = obj.limitReached;
        const now = new Date(), then = new Date(obj.reachedDate);

        if (limitReached && now > then && now.getMonth() != then.getMonth()) {
            limitReached = false;
            chrome.storage.sync.set({ 'limitReached': false });
        }
        if (!limitReached) {
            HTTP.open('POST', API_URL, true);
            let data = new FormData();
            data.append('text', TEXT_STR);
            data.append('subjects', JSON.stringify(obj.blist));
            data.append('url', window.location.href);
            data.append('mode', obj.mode);
            HTTP.send(data);
        }
        HTTP.onreadystatechange = function () {
            if (HTTP.readyState == 4 && HTTP.status == 200) {
                const shouldBlockPage = HTTP.responseText.includes('yes');
                if (shouldBlockPage) {
                    document.documentElement.scrollTop = 0;
                    document.documentElement.innerHTML = `
                        <p style="position: absolute; left: 50%; top: 40%; font-size: 30px; transform: translateX(-50%);">
                            Blocked :D
                        </p>`;
                } else if (HTTP.responseText === 'lim') {
                    chrome.storage.sync.set({ 'limitReached': true, 'reachedDate': now.toJSON() });
                }
                console.log('Response text: ' + HTTP.responseText);
            }
        }
    });
}


function isLoggedIn() {
    let HTTP = new XMLHttpRequest();
    let url = 'https://tunnel.nightstarry.repl.co/login_status';

    HTTP.open('GET', url, true);
    HTTP.send(null);

    HTTP.onreadystatechange = function () {
        if (HTTP.readyState == 4) {
            let loginStatus = HTTP.responseText;
            console.log(loginStatus === 'True');
        }
        return loginStatus === 'True';
    }
}

window.onload = checkSubject;
