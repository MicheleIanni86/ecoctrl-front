document.addEventListener("DOMContentLoaded", function () {
    const messagesGrid2 = document.getElementById("messagesGrid2");
    const form = document.getElementById("ticketForm");
    const userInput = document.getElementById("userInput");
    const segnalazione = document.getElementById("segnalazione");
    const userError = document.getElementById("userError");
    const segnalazioneError = document.getElementById("segnalazioneError");

    // **Funzione per caricare i messaggi dal server**
    function updateMessagesGrid2() {
        fetch("http://localhost/message.php", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.error("Errore nel recupero dei dati");
                return;
            }

            messagesGrid2.innerHTML = ""; // Pulisce la tabella

            data.messages.forEach(msg => {
                const messageRow = document.createElement("tr");

                messageRow.innerHTML = `
                    <td class="text-center">${msg.user}</td>
                    <td class="overflow-auto">${msg.message}</td>
                    <td class="text-center">${msg.timestamp}</td>
                    <td class="text-center">
                        <button class="btn btn-warning btn-sm" onclick="editMessage(${msg.id})">Modifica</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteMessage(${msg.id})">Elimina</button>
                    </td>
                `;
                messagesGrid2.appendChild(messageRow);
            });
        })
        .catch(error => console.error("Errore nel caricamento delle segnalazioni:", error));
    }

    // **Carica la tabella all'avvio**
    updateMessagesGrid2();

    // **Gestione dell'invio del form**
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        let formIsValid = true;
        userError.style.display = "none";
        segnalazioneError.style.display = "none";
        userInput.classList.remove("is-invalid");
        segnalazione.classList.remove("is-invalid");

        const username = userInput.value.trim().toLowerCase();
        const messageText = segnalazione.value.trim();

        if (messageText.length < 10) {
            formIsValid = false;
            segnalazioneError.style.display = "block";
            segnalazione.classList.add("is-invalid");
        }

        if (formIsValid) {
            const formData = {
                user: username,
                message: messageText
            };

            fetch("http://localhost/message.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Messaggio salvato con successo!");
                    updateMessagesGrid2();
                    form.reset();
                } else {
                    alert("Errore: " + data.message);
                }
            })
            .catch(error => console.error("Errore AJAX:", error));
        }
    });

    // **Funzione per eliminare un messaggio**
    window.deleteMessage = function (messageId) {
        fetch("http://localhost/message.php", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: messageId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Messaggio eliminato con successo!");
                updateMessagesGrid2();
            } else {
                alert("Errore: " + data.message);
            }
        })
        .catch(error => console.error("Errore eliminazione:", error));
    };

    // **Funzione per modificare un messaggio**
    window.editMessage = function (messageId) {
        const newMessage = prompt("Modifica il messaggio:");
        if (!newMessage || newMessage.trim().length < 10) {
            alert("Il messaggio deve contenere almeno 10 caratteri.");
            return;
        }

        fetch("http://localhost/message.php", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: messageId, message: newMessage.trim() })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Messaggio modificato con successo!");
                updateMessagesGrid2();
            }
        })
        .catch(error => console.error("Errore modifica:", error));
    };
});
