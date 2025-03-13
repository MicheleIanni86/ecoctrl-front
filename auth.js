document.addEventListener("DOMContentLoaded", () => {
    const authForm = document.getElementById("auth-form");
    const toggleAuth = document.getElementById("toggle-auth");
    const formTitle = document.getElementById("form-title");

    let isLogin = true; // Stato attuale del form (Login o Registrazione)

    // Cambia tra login e registrazione
    toggleAuth.addEventListener("click", (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        formTitle.textContent = isLogin ? "Login" : "Registrazione";
        toggleAuth.innerHTML = isLogin ? 
            'Non hai un account? <a href="#">Registrati</a>' : 
            'Hai già un account? <a href="#">Accedi</a>';
    });

    // Gestione del form
    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
    
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
    
        const endpoint = "http://localhost/ecoctrl-back/api.php"; 
        
        const data = { 
            action: isLogin ? "login" : "register",  //aggiunto action correttamente nel body JSON
            email, 
            password 
        };
        
        console.log("Sto inviando questa richiesta:", JSON.stringify(data)); // ✅ Debug

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            console.log("Risultato dal server:", result); // ✅ Debug

            if (result.success) {
                localStorage.setItem("user", JSON.stringify(result.user));

                // ✅ Reindirizzamento corretto in base al ruolo
                if (result.user.role === "Client") {
                    window.location.href = "index.html"; // Client va su index.html
                } else if (result.user.role === "Admin") {
                    window.location.href = "http://localhost/ecoctrl-back/message.php"; // Admin va su message.php
                }
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Errore nella richiesta:", error);
        }
    });
});
