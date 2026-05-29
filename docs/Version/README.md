# Added   = cose nuove
# Changed = cose modificate
# Fixed   = bug corretti
# Removed = cose eliminate

1.0.0
│ │ │
│ │ └── PATCH = correzioni bug
│ └──── MINOR = nuove funzionalità compatibili
└────── MAJOR = modifiche importanti/non compatibili

# Genie AppCore Skin

Skin custom per Profound UI Genie finalizzata alla modernizzazione di applicazioni IBM i / AS400.

---

# Obiettivo del progetto

L’obiettivo della skin è trasformare le schermate 5250 tradizionali in interfacce moderne, responsive e più usabili, senza modificare i programmi COBOL/RPG esistenti.

La skin introduce:

- layout Bootstrap responsive
- gestione avanzata subfile
- componenti UI moderni
- menu offcanvas
- dropdown dinamici
- accessibilità
- utility di supporto
- personalizzazioni utente persistenti

---

# Tecnologie utilizzate

- JavaScript Vanilla
- Bootstrap 5
- Profound UI Genie
- IBM i / AS400

---

# Struttura progetto

```text
project/
│
├── css/
│   └── style.css
│
├── js/
│   ├── version.js
│   ├── header.js
│   ├── redraw.js
│   ├── redrawAdvanced.js
│   ├── subfile.js
│   ├── console.js
│   ├── webService/
│   └── ...
│
├── images/
├── icons/
│
├── docs/
│
├── CHANGELOG.md
└── README.md