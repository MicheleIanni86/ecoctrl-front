document.addEventListener("DOMContentLoaded", function () {
    const messagesGrid2 = document.getElementById("messagesGrid2");
    const form = document.getElementById("ticketForm");
    const userInput = document.getElementById("userInput");
    const segnalazione = document.getElementById("segnalazione");
    const userError = document.getElementById("userError");
    const segnalazioneError = document.getElementById("segnalazioneError");

    const API_URL = "http://localhost/ecoctrl-back/message.php?json=true";

    // **Lista utenti autorizzati**
    const allowedUsers = ["Michele", "Andrea", "Franco"];

    // **Funzione per troncare il testo (max 50 caratteri)**
    function truncateText(text, maxLength = 50) {
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    }

    function updateMessagesGrid2() {
        fetch(API_URL)
            .then(response => response.json())
            .then(data => {
                messagesGrid2.innerHTML = "";

                if (!data.success || !data.messages) {
                    console.error("Errore nel recupero dei dati:", data.message);
                    return;
                }

                data.messages.forEach(msg => {
                    const messageRow = document.createElement("tr");
                    messageRow.innerHTML = `
                        <td class="text-center">${msg.user}</td>
                        <td class="overflow-auto" title="${msg.message}">${truncateText(msg.message)}</td>
                        <td class="text-center">${msg.timestamp}</td>
                        <td class="text-center">
                            <button class="btn btn-warning btn-sm edit-btn" data-id="${msg.id}" data-message="${msg.message}">Modifica</button>
                            <button class="btn btn-danger btn-sm delete-btn" data-id="${msg.id}">Elimina</button>
                        </td>
                    `;
                    messagesGrid2.appendChild(messageRow);
                });

                // **Aggiunge gli event listener ai pulsanti dopo il caricamento**
                document.querySelectorAll(".edit-btn").forEach(button => {
                    button.addEventListener("click", function () {
                        const messageId = this.getAttribute("data-id");
                        const currentMessage = this.getAttribute("data-message");
                        editMessage(messageId, currentMessage);
                    });
                });

                document.querySelectorAll(".delete-btn").forEach(button => {
                    button.addEventListener("click", function () {
                        const messageId = this.getAttribute("data-id");
                        deleteMessage(messageId);
                    });
                });
            })
            .catch(error => console.error("Errore nel caricamento delle segnalazioni:", error));
    }

    // **Carica la tabella all'avvio**
    updateMessagesGrid2();

    // **Gestione dell'invio del form**
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        userError.style.display = "none";
        segnalazioneError.style.display = "none";
        userInput.classList.remove("is-invalid");
        segnalazione.classList.remove("is-invalid");

        const username = userInput.value.trim();
        const messageText = segnalazione.value.trim();

        // **Controllo se l'utente è autorizzato**
        if (!allowedUsers.includes(username)) {
            userError.style.display = "block";
            userInput.classList.add("is-invalid");
            userError.textContent = "Utente non autorizzato!";
            return;
        }

        // **Controllo lunghezza messaggio**
        if (messageText.length < 10) {
            segnalazioneError.style.display = "block";
            segnalazione.classList.add("is-invalid");
            return;
        }

        const formData = { user: username, message: messageText };

        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateMessagesGrid2();
                    form.reset();
                } else {
                    alert("Errore: " + data.message);
                }
            })
            .catch(error => console.error("Errore AJAX:", error));
    });

    // **Funzione per modificare un messaggio**
    function editMessage(messageId, currentMessage) {
        const newMessage = prompt("Modifica il messaggio:", currentMessage);
        if (!newMessage || newMessage.trim().length < 10) {
            alert("Il messaggio deve contenere almeno 10 caratteri.");
            return;
        }

        fetch(API_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: messageId, message: newMessage.trim() })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateMessagesGrid2();
                }
            })
            .catch(error => console.error("Errore modifica:", error));
    }

    // **Funzione per eliminare un messaggio**
    function deleteMessage(messageId) {
        if (confirm("Sei sicuro di voler eliminare questo messaggio?")) {
            fetch(API_URL, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: messageId })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        updateMessagesGrid2();
                    } else {
                        alert("Errore: " + data.message);
                    }
                })
                .catch(error => console.error("Errore eliminazione:", error));
        }
    }
});
