const indexedDB = window.indexedDB;

let db;

const request = indexedDB.open("Budget-Tracker", 1);

request.onerror = function (event) {

    console.error("openDb:", event.target.errorCode);
};

request.onsuccess = function (event) {
    db = event.target.result;
    console.log("openDb DONE");

    if (navigator.onLine) {
        saveToDB()
    }
};

request.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore("budgets", { autoIncrement: true });

}

function saveRecord(budgets) {
    let action = db.transaction(["budgets"], 'readwrite').objectStore("budgets");

    let request = action.add(budgets);
    console.log(request)

}

function saveToDB() {
    let action = db.transaction(["budgets"], 'readwrite').objectStore("budgets");

    const getAll = action.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: { Accept: 'application/json, text/plain, */*', 'Content-Type': 'application/json' }
            }).then(res => res.json()).then(() => {
                let action = db.transaction(["budgets"], 'readwrite').objectStore("budgets");
                action.clear()

            })
        }
    }
}

window.addEventListener('online', saveToDB)
