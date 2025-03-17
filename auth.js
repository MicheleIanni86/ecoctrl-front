document.addEventListener("DOMContentLoaded", () => {
    const authForm = document.getElementById("auth-form");
    const toggleAuth = document.getElementById("toggle-auth");
    const formTitle = document.getElementById("form-title");
    const registerFields = document.getElementById("register-fields"); // Campi Nome e Cognome
    const submitButton = authForm.querySelector("button");

    let isLogin = true; // Stato attuale del form (Login o Registrazione)

    // Cambia tra login e registrazione
    toggleAuth.addEventListener("click", (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        formTitle.textContent = isLogin ? "Login" : "Registrazione";
        toggleAuth.innerHTML = isLogin ?
            'Non hai un account? <a href="#">Registrati</a>' :
            'Hai già un account? <a href="#">Accedi</a>';

        // Mostra/Nasconde Nome e Cognome
        registerFields.style.display = isLogin ? "none" : "block";
        submitButton.textContent = isLogin ? "Accedi" : "Registrati";
    });

    // Gestione del form
    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            alert("Email e password sono obbligatori!");
            return;
        }

        const data = {
            action: isLogin ? "login" : "register",
            email,
            password
        };

        // Se è registrazione, aggiungi Nome e Cognome
        if (!isLogin) {
            const name = document.getElementById("name").value.trim();
            const surname = document.getElementById("surname").value.trim();

            if (!name || !surname) {
                alert("Nome e Cognome sono obbligatori per la registrazione!");
                return;
            }

            data.name = name;
            data.surname = surname;
        }

        console.log("Sto inviando questa richiesta:", JSON.stringify(data)); // ✅ Debug

        try {
            const response = await fetch("../ecoctrl-back/api.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            console.log("Risultato dal server:", result);

            if (result.success) {
                if (isLogin) {
                    // ✅ Salva i dati dell'utente nel localStorage
                    localStorage.setItem("user", JSON.stringify(result.user));

                    // ✅ Redirect in base al ruolo
                    if (result.user.role === "Client") {
                        window.location.href = "index.html";
                    } else if (result.user.role === "Admin") {
                        window.location.href = "http://localhost/ecoctrl-back/message.php";
                    } else if (result.user.role === "SuperAdmin") {
                        window.location.href = "http://localhost/ecoctrl-back/manage_categories.php";
                    }

                } else {
                    // ✅ Registrazione completata: Mostra alert e reindirizza alla login
                    alert("Registrazione completata! Ora puoi accedere.");
                    window.location.href = "auth.html"; // Torna alla login
                }
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Errore nella richiesta:", error);
        }
    });
});
