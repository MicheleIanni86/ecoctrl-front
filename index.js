const API_URL = "http://localhost/ecoctrl-back/api.php";

// Controllo accesso solo per utenti Client
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "Client") {
        window.location.href = "auth.html"; // Se non è un Client, torna alla pagina di login
    }
});

document.getElementById("ticketForm").onsubmit = async function (e) {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user")); // Ottiene i dati dell'utente loggato
    if (!user) {
        alert("Devi essere loggato per inviare una segnalazione.");
        return;
    }

    const messageText = document.getElementById("segnalazione").value.trim();

    if (messageText.length < 10) {
        alert("La segnalazione deve contenere almeno 10 caratteri.");
        return;
    }

    // ✅ Nuovo oggetto dati con action
    const requestData = {
        action: "createTicket", // ✅ Specifica l'azione corretta
        user_id: user.id, // Usa l'ID utente loggato
        description: messageText
    };

    console.log("Sto inviando questa richiesta:", requestData); // DEBUG

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();
        console.log("Risposta del server:", result); // DEBUG

        if (result.success) {
            alert("Segnalazione inviata con successo!");
            document.getElementById("ticketForm").reset();
        } else {
            alert("Errore nell'invio della segnalazione: " + result.message);
        }
    } catch (error) {
        console.error("Errore AJAX:", error);
    }
};

// Aggiornamento lista messaggi
function updateMessagesGrid2() {
    fetch(API_URL + "?action=getMessages") // ✅ Ora passa correttamente l'action
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

updateMessagesGrid2(); // Carica i messaggi al caricamento della pagina
