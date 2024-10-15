// spesa.db con tabelle:
// Utente(username, passsword, email)
// Prodotto(id, nome, comporato, utente)

// Il DB deve essere creato se non esiste

// 1. Registrare un utente
// 2. Inserire un prodotto
// 3. Contrassegnare come completato prodotto esistente
// 4. Visualizzare lista prodotti di un utente
// 5. Exit

import sqlite3 from "sqlite3";

const db = new sqlite3.Database("spesa.db", (err) => {
    if (err) {
        console.error("Errore nell'apertura del DB.\n", err.message);
    }
    else {
        console.log("DB aperto con successo.");
    }
});

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS Utente (username TEXT NOT NULL, password TEXT NOT NULL, email TEXT NOT NULL UNIQUE, PRIMARY KEY(username))");
    db.run("CREATE TABLE IF NOT EXISTS Prodotto (nome TEXT NOT NULL, comprato INTEGER NOT NULL DEFAULT 0, id INTEGER NOT NULL, utente TEXT NOT NULL, FOREIGN KEY('utente') REFERENCES Utente(username), PRIMARY KEY(id AUTOINCREMENT))");
});

db.close();