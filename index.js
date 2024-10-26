// spesa.db con tabelle:
// Utente(username, password, email)
// Prodotto(id, nome, comprato, utente)

// Il DB deve essere creato se non esiste

// 1. Registrare un utente
// 2. Inserire un prodotto
// 3. Contrassegnare come comprato prodotto esistente
// 4. Visualizzare lista prodotti di un utente
// 5. Exit

import sqlite3 from "sqlite3";
import inquirer from 'inquirer';

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

const menu = [
    {
        type: 'list',
        name: 'option',
        message: 'Cosa vuoi fare?',
        choices: ['Registrare un nuovo utente', 'Inserire un prodotto nella lista della spesa', 'Contrassegnare come comprato un prodotto esistente', 'Visualizzare la lista della spesa di un utente', 'Uscire dal programma']
    }
];

const register = [
    {
        type: 'input',
        name: 'username',
        message: 'Inserisci il tuo username',
        validate: function (value) {
            if (value.trim().length) {
                return true;
            } else {
                return 'Inserisci il tuo username';
            }
        }
    },
    {
        type: 'password',
        name: 'password',
        message: 'Inserisci la tua password',
        validate: function (value) {
            if (value.trim().length && isValidPassword(value)) {
                return true;
            } else {
                return 'Inserisci una password valida';
            }
        }
    },
    {
        type: 'input',
        name: 'email',
        message: 'Inserisci la tua email',
        validate: function (value) {
            if (value.trim().length && isValidEmail(value)) {
                return true;
            } else {
                return 'Inserisci un indirizzo email valido';
            }
        }
    }
];

const askUsername = [
    {
        type: 'input',
        name: 'username',
        message: 'Inserisci lo username',
        validate: function (value) {
            if (value.trim().length) {
                return true;
            } else {
                return 'Inserisci uno username valido!';
            }
        }
    }
];

function main() {
    inquirer.prompt(menu).then((answers) => {
        switch (answers.option) {
            case 'Registrare un nuovo utente':
                registration();
                break;
            case 'Inserire un prodotto nella lista della spesa':
                addProduct();
                break;
            case 'Contrassegnare come comprato un prodotto esistente':
                markAsBought();
                break;
            case 'Visualizzare la lista della spesa di un utente':
                viewList();
                break;
            case 'Uscire dal programma':
                db.close((err) => {
                    if (err) {
                        console.error("Errore nella chiusura del DB!");
                    } else {
                        console.log("DB chiuso con successo!");
                    }
                });
                return;
        }
    });
}

function viewList() {
    inquirer.prompt(askUsername).then((answers) => {
        let stmt = db.prepare("SELECT * FROM Prodotto WHERE Utente = ? ;");
        stmt.all(answers.username.trim().toLowerCase(), (err, rows) => {
            if (err) {
                console.error("Errore nella ricerca della lista della spesa!");
                main();
            } else if (rows.length === 0) {
                console.log("Lista della spesa vuota");
                main();
            } else {
                console.log("Lista della spesa:");
                rows.forEach((row) => {
                    console.log(row);
                });
                main();
            }
        });
    });
}


function registration() {
    inquirer.prompt(register).then((answers) => {
        let stmt = db.prepare("SELECT username FROM Utente WHERE username = ? ;");
        stmt.get(answers.username.trim().toLowerCase(), (err, row) => {
            if (err) {
                console.error("Errore nella ricerca dell'utente!");
                main();
            } else if (row) {
                console.log("Username già esistente");
                main();
            } else {
                let stmt = db.prepare("SELECT email FROM Utente WHERE email = ? ;");
                stmt.get(answers.email.trim(), (err, row) => {
                    if (err) {
                        console.error("Errore nella ricerca dell'email!");
                        main();
                    } else if (row) {
                        console.log("Indirizzo email già esistente");
                        main();
                    } else {
                        let stmt = db.prepare("INSERT INTO Utente (username, password, email) VALUES (?, ?, ?);");
                        stmt.run(answers.username.trim().toLowerCase(), answers.password.trim(), answers.email.trim(), (err) => {
                            if (err) {
                                console.error("Impossibile inserire i dati utente!");
                                main();
                            } else {
                                console.log("Utente registrato con successo");
                                main();
                            }
                        });
                    }
                });
            }
        });
    });
}

function isValidPassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[$&_\#@\-%\*]).+$/;
    return passwordRegex.test(password);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

main();