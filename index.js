const API_URL = "http://localhost/ecoctrl-back/api.php";

// Utenti autorizzati e relativi user_id nel database
const allowedUsers = {
    "Michele": 1,
    "Andrea": 2,
    "Franco": 3
};

document.getElementById("ticketForm").onsubmit = function (e) {
    e.preventDefault();

    const username = document.getElementById("userInput").value.trim();
    const messageText = document.getElementById("segnalazione").value.trim();

    // Controlla se l'utente è autorizzato
    if (!allowedUsers.hasOwnProperty(username)) {
        alert("Utente non autorizzato!");
        return;
    }

    // Controlla lunghezza messaggio
    if (messageText.length < 10) {
        alert("Il messaggio deve contenere almeno 10 caratteri.");
        return;
    }

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            messageText: messageText,
            user_id: allowedUsers[username],  // Ora usa l'id corretto!
            ticket_id: 1                      // Usa ID ticket valido
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                updateMessagesGrid2();
                document.getElementById("ticketForm").reset();
            } else {
                alert(data.message);
            }
        })
        .catch(e => console.error("Errore AJAX:", e));
};

// Aggiornamento lista messaggi
function updateMessagesGrid2() {
    fetch(API_URL)
        .then(r => r.json())
        .then(data => {
            let html = "";
            data.messages.forEach(m => {
                html += `<tr><td class="fw-bold fs-5">${m.user}</td><td>${m.message}</td><td>${m.timestamp}</td></tr>`;

            });
            document.getElementById("messagesGrid2").innerHTML = html;
        })
        .catch(e => console.error("Errore AJAX:", e));
}

updateMessagesGrid2();
