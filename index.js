const API_URL = "http://localhost/ecoctrl-back/api.php";

// ✅ Controllo accesso solo per utenti Client
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "Client") {
        window.location.href = "auth.html"; // Se non è un Client, torna alla pagina di login
    } else {
        // ✅ Mostra il nome dell'utente loggato accanto a "Utente"
        document.getElementById("userInfo").textContent = `${user.name} ${user.surname}`;

        // ✅ Carica subito i ticket appena il Client accede
        updateUserTicketsGrid();
    }
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
    const categoryId = document.getElementById("ticketCategory").value; // ✅ Recuperiamo l'ID della categoria

    const requestData = {
        action: "createTicket",
        user_id: user.id,
        description: messageText,
        ticketCat_id: categoryId // ✅ Aggiungiamo la categoria alla richiesta
    };

    console.log("📤 Sto inviando questa richiesta:", requestData); // ✅ Debug


    try {
        const response = await fetch("../ecoctrl-back/api.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();
        console.log("📥 Risposta del server:", result); // ✅ Debug

        if (result.success) {
            alert("Segnalazione inviata con successo!");
            document.getElementById("ticketForm").reset();
            updateUserTicketsGrid(); // ✅ Aggiorna la lista dei messaggi
        } else {
            alert("Errore nell'invio della segnalazione: " + result.message);
        }
    } catch (error) {
        console.error("❌ Errore AJAX:", error);
    }
};


async function updateUserTicketsGrid() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "Client") {
        console.error("❌ Nessun utente Client loggato!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}?action=getUserTickets&user_id=${user.id}`);
        const jsonData = await response.json();

        if (!jsonData.success) {
            console.error("❌ Errore: " + jsonData.message);
            return;
        }

        const tableBody = document.getElementById("messagesGrid2");

        if (!tableBody) {
            console.error("❌ Errore: L'elemento con ID 'messagesGrid2' non esiste nella pagina.");
            return;
        }

        tableBody.innerHTML = "";


        if (!jsonData.tickets || jsonData.tickets.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='4'>Nessun ticket trovato.</td></tr>";
            return;
        }

        jsonData.tickets.forEach(ticket => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="fw-bold fs-5">${ticket.message}</td>
                <td>${ticket.timestamp}</td>
                <td>${ticket.status}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("❌ Errore AJAX:", error);
    }
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}?action=get_ticket_categories`);
        const textResponse = await response.text(); // ✅ Leggiamo la risposta come testo per debug
        console.log("📥 Risposta API categorie (testo):", textResponse);

        const categories = JSON.parse(textResponse); // ✅ Convertiamo in JSON
        console.log("📥 Risposta API categorie (JSON):", categories);

        if (!Array.isArray(categories)) {
            throw new Error("❌ Errore: La risposta non è un array valido.");
        }

        const select = document.getElementById("ticketCategory");
        select.innerHTML = "<option value=''>Seleziona una categoria...</option>";

        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("❌ Errore nel caricamento delle categorie:", error);
    }
}

// ✅ Carichiamo le categorie quando la pagina si carica
document.addEventListener("DOMContentLoaded", loadCategories);












