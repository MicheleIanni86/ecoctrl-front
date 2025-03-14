const API_URL = "http://localhost/ecoctrl-back/api.php";

// ✅ Controllo accesso solo per utenti Client
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "Client") {
        window.location.href = "auth.html"; // Se non è un Client, torna alla pagina di login
    } else {
        // ✅ Mostra il nome dell'utente loggato accanto a "Utente"
        document.getElementById("userInfo").textContent = `${user.name} ${user.surname}`;
    }

    updateMessagesGrid2(); // ✅ Carica i messaggi al caricamento della pagina
});

// ✅ Gestione invio segnalazione
document.getElementById("ticketForm").onsubmit = async function (e) {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Devi essere loggato per inviare una segnalazione.");
        return;
    }

    const messageText = document.getElementById("segnalazione").value.trim();

    if (messageText.length < 10) {
        alert("La segnalazione deve contenere almeno 10 caratteri.");
        return;
    }

    // ✅ Creiamo il corpo della richiesta
    const requestData = {
        action: "createTicket",
        user_id: user.id,
        description: messageText
    };

    console.log("📤 Sto inviando questa richiesta:", requestData); // ✅ Debug

    try {
        const response = await fetch(`${API_URL}?action=createTicket`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();
        console.log("📥 Risposta del server:", result); // ✅ Debug

        if (result.success) {
            alert("Segnalazione inviata con successo!");
            document.getElementById("ticketForm").reset();
            updateMessagesGrid2(); // ✅ Aggiorna la lista dei messaggi
        } else {
            alert("Errore nell'invio della segnalazione: " + result.message);
        }
    } catch (error) {
        console.error("❌ Errore AJAX:", error);
    }
};

// ✅ Funzione per aggiornare la lista delle segnalazioni (ora usa `tickets`)
function updateMessagesGrid2() {
    console.log("📡 Sto inviando richiesta GET a getMessages...");

    fetch(`${API_URL}?action=getMessages`)
        .then(response => response.text())  // ✅ Riceviamo la risposta come testo per debug
        .then(data => {
            console.log("📥 Risposta grezza dal server:", data);  // ✅ Log per capire cosa arriva realmente

            try {
                const jsonData = JSON.parse(data); // ✅ Proviamo a convertire in JSON
                console.log("📥 Risposta da getMessages:", jsonData);

                if (!jsonData.success) {
                    console.error("❌ Errore: " + jsonData.message);
                    return;
                }

                if (!jsonData.messages || jsonData.messages.length === 0) {
                    console.warn("⚠️ Nessun messaggio ricevuto dal server.");
                    document.getElementById("messagesGrid2").innerHTML = "<tr><td colspan='3'>Nessuna segnalazione trovata.</td></tr>";
                    return;
                }

                let html = "";
                jsonData.messages.forEach(m => {
                    html += `<tr><td class="fw-bold fs-5">${m.user}</td><td>${m.message}</td><td>${m.timestamp}</td></tr>`;
                });
                document.getElementById("messagesGrid2").innerHTML = html;
            } catch (error) {
                console.error("❌ Errore nel parsing JSON:", error);
                console.error("📌 Risposta grezza dal server che ha causato l'errore:", data);  // ✅ Log importante
            }
        })
        .catch(error => console.error("❌ Errore AJAX:", error));
}




