chrome.runtime.onMessage.addListener(function (username) {
    if (username === 'success') {
        console.log(username);
    } else {
        console.log('bad');
    }
})


function getDoc() {
    var userInfoRef = db.collection("Users").doc(username);
    userInfoRef.get().then((doc) => {
        if (doc.exists) {
            console.log("Document data", doc.data());
        } else {
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}
