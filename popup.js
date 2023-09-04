import "./bootstrap-5.3.1-dist/js/bootstrap.min.js";

window.onload = function () {
    const blockListEle = document.getElementById('blist');

    function updateBlockList(listHandler) {
        return () => {
            chrome.storage.sync.get({ 'blist': [] }, function (obj) {
                listHandler(obj.blist);
            });
        }
    }
    
    function appendItemHTML(listEle, newBlockItem) {
        let listItem = document.createElement('li');
        let delBtn = document.createElement('button');

        listItem.textContent = newBlockItem;
        listItem.setAttribute('class', 'fw-normal');
        delBtn.innerText = '✗';
        delBtn.setAttribute('class', 'delBtn text-danger');
        delBtn.onclick = updateBlockList(function(blist) {
            let idx = blist.indexOf(newBlockItem);
            if (idx > -1) blist.splice(idx, 1);
            listItem.remove();
            chrome.storage.sync.set({ 'blist': blist });
        })
        listItem.appendChild(delBtn);
        listEle.appendChild(listItem);
    }

    // Popup loading: Iterate and set each blocked domain to the list
    updateBlockList(function (blist) {
        blist.forEach(function (blockItem) {
            appendItemHTML(blockListEle, blockItem);
        })
    })();

    const strictMode = document.getElementById("strict-mode");
    const gptMode = document.getElementById("gpt-mode");

    chrome.storage.sync.get({'mode': 'strict'}, function (obj) {
        if (obj.mode === 'strict')
            strictMode.setAttribute('class', 'border border-light border-5 rounded-1');
        else
            gptMode.setAttribute('class', 'border border-light border-5 rounded-1');
    });

    strictMode.onclick = function() {
        // Highlight strict mode and de-highlight GPT mode
        this.setAttribute('class', 'border border-light border-5 rounded-1');
        gptMode.removeAttribute('class');
        chrome.storage.sync.set({ 'mode': 'strict' });
    }

    gptMode.onclick = function() {
        chrome.storage.sync.get({'limitReached': false}, function (obj) {
            if (!obj.limitReached) {
                // De-highlight strict mode and highlight GPT mode
                gptMode.setAttribute('class', 'border border-light border-5 rounded-1');
                strictMode.removeAttribute('class');
                chrome.storage.sync.set({ 'mode': 'gpt' });
            } else {
                // Tell user that the limit is reached
                // const gptModal = new bootstrap.Modal('#gptModal', {});
                // gptModal.show();
            }
        })
    }

    // New domain entered: Only set the new domain, also update the list in storage
    document.getElementById('blistSubmit').onclick = updateBlockList(function (blist) {
        const newBlockItem = document.getElementById('blistInput').value;
        if (newBlockItem.trim() && !blist.includes(newBlockItem)) {
            blist.push(newBlockItem);
            appendItemHTML(blockListEle, newBlockItem);
            chrome.storage.sync.set({ 'blist': blist });
        }
    });

    document.getElementById('blistRemoveAll').onclick = function () {
        chrome.storage.sync.clear();
        blockListEle.innerHTML = '';
    }
}
