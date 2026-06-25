# Analisi tecnica - Profound UI Genie e personalizzazione AppCore

Data documento: 19/06/2026  

---

## 1. Scopo del documento

Questo documento descrive il funzionamento tecnico di Profound UI Genie e il modo in cui la skin personalizzata `Iris_TRB00159` estende, riorganizza e modernizza le videate IBM i / AS400 5250.

La personalizzazione non modifica i programmi legacy sottostanti. Interviene invece sul DOM HTML generato da Genie, trasformando la rappresentazione grafica e funzionale delle schermate tramite JavaScript, CSS, Bootstrap e web service applicativi.

---

## 2. Architettura generale

Profound UI Genie converte una videata 5250 in elementi HTML. La skin personalizzata intercetta questi elementi e li riorganizza in un'interfaccia più moderna.

Flusso tecnico generale:

```text
Programma IBM i / 5250
        |
        v
Profound UI Genie
        |
        v
DOM HTML generato
        |
        v
Skin custom JavaScript/CSS
        |
        v
Interfaccia modernizzata
```

Il principio tecnico principale è:

> Il DOM può essere trasformato, ma gli elementi necessari al dialogo con Genie devono restare collegati al runtime 5250.

Per questo motivo gli input originali generati da Genie non devono essere clonati quando devono rimanere interattivi. Devono essere spostati, wrappati o arricchiti mantenendo ID e attributi originali.

---

## 3. Stack tecnico

La soluzione utilizza:

- IBM i / AS400
- Profound UI Genie
- HTML generato da videate 5250
- JavaScript vanilla
- jQuery per chiamate AJAX
- Bootstrap
- Bootstrap Icons
- Font Awesome
- CSS custom
- Flatpickr
- Choices.js
- html2canvas
- Vanta
- LocalStorage
- SessionStorage
- Web service applicativi
- Git
- Beyond Compare per propagazione ambienti

---

## 4. File principali della skin

I file principali della skin sono:

| File / Cartella | Ruolo |
|---|---|
| `start.html` | Punto di bootstrap della skin |
| `config.js` | Configurazione base Genie |
| `properties.js` | Proprietà applicative, ambienti, web service |
| `version.js` | Versione della skin/applicativo |
| `js/core/initial.js` | Inizializzazione iniziale e workstation ID |
| `js/core/custom.js` | Lifecycle principale della skin |
| `js/redraw/redraw.js` | Motore principale di ridisegno |
| `js/redraw/redrawCustomized/` | Ridisegni custom per programmi specifici |
| `js/redraw/redrawAdvanced/` | Ridisegni avanzati per casi complessi |
| `js/webService/` | Gestione chiamate web service |
| `js/utility/` | Utility comuni |
| `css/core/` | Layout generale |
| `css/look/` | Tema grafico, font e colori |
| `css/redraw/` | Stili delle videate ridisegnate |
| `Screens/` | Schermate Genie salvate/mappate |

---

## 5. Configurazione Genie

Il file `config.js` definisce il comportamento base di Genie.

Parametri rilevanti:

```js
{
  "enableDesigner": false,
  "connectionType": "V",
  "detectSubfile": true,
  "detectSubfilePatterns": true,
  "detectDateFields": true,
  "defaultDateFormat": "DD/MM/YYYY",
  "locale": "it_IT",
  "detectMenus": true,
  "functionKeyButtons": true,
  "preventAutoTab": true,
  "highlightOnFocus": true
}
```

Questa configurazione abilita il riconoscimento di subfile, menu, date e tasti funzione, fornendo alla skin una base più ricca per classificare e trasformare la schermata.

---

## 6. Bootstrap della pagina

`start.html` carica in sequenza:

1. CSS di Profound UI.
2. Librerie esterne locali.
3. CSS della skin.
4. `properties.js`.
5. `version.js`.
6. `initial.js`.
7. Observer.
8. `genie.js`.
9. Utility applicative.
10. Core della skin.
11. Web service.
12. Redraw generale.
13. Redraw custom e advanced.
14. Footer.

L'ordine di caricamento è tecnicamente importante perché molte funzioni dipendono da variabili globali definite nei file caricati prima.

---

## 7. Proprietà applicative

Il file `properties.js` centralizza molte configurazioni.

Aree principali:

- log applicativo;
- logo e favicon;
- configurazione web service;
- ambiente applicativo;
- workstation ID;
- programma principale AppCore;
- menu principale;
- immagini background;
- abilitazione redraw;
- gestione notifiche;
- gestione subfile;
- impostazioni layout.

---

## 8. Gestione ambienti e web service

La skin distingue ambienti interni e pubblici.

Ambienti configurati:

- `TEST`
- `TEST_UAT`
- `PRODUZIONE`

La funzione `calculateEnvironmentWs()` determina l'ambiente in base a hostname e porta.

La funzione `getBaseWsUrl()` costruisce l'URL base dei web service.

La funzione `buildWebServiceUrl(url, forcedEnv)` normalizza l'URL finale del servizio tenendo conto di:

- ambiente infrastrutturale;
- ambiente applicativo;
- accesso interno/pubblico;
- prefisso web service;
- reverse proxy;
- servizio richiesto.

Regola importante:

> Se l'infrastruttura è produzione ma l'ambiente applicativo non è PRD, i web service devono puntare a TEST.

---

## 9. Web service applicativi

La skin utilizza web service per ottenere informazioni non presenti direttamente nella videata 5250.

Servizi principali:

| Servizio | Funzione |
|---|---|
| `BGNIDSPF` | Recupero metadati display file, campi e opzioni |
| `BGNIATTR` | Recupero attributi, classi e stili |
| `BGNIWMSG` | Recupero messaggi e notifiche |

File principali:

- `js/webService/webService.js`
- `js/webService/webService_BGNIDSPF.js`
- `js/webService/webService_BGNIATTR.js`
- `js/webService/webService_BGNIWMSG.js`

Funzioni rilevanti:

```js
invokeWebService()
buildWebServiceUrl()
buildWebServiceUrlCacheKey()
groupOptionsByFieldId()
handleResponse_BGNIDSPF()
modifyElem()
```

È presente anche una cache locale in memoria tramite oggetto `localCache`.

---
## 10. Lifecycle Genie personalizzato

La skin intercetta il ciclo di vita Genie tramite funzioni globali.

Funzioni principali:

```js
beforeLoad()
afterLoad()
customize()
pui.genie.afterInit
```

### beforeLoad

Responsabilità:

- avviare loader;
- rilevare listener;
- leggere skin corrente;
- impostare lingua;
- calcolare dimensione video 80/132 colonne;
- applicare media query;
- resettare sidebar, finestre e contenitori;
- rimuovere animazioni precedenti.

### afterLoad

Responsabilità:

- fermare loader;
- impostare parametri Genie;
- leggere programma corrente;
- applicare font;
- ridimensionare area;
- convertire stili;
- gestire schermata precedente;
- disabilitare autocomplete.

### customize

Responsabilità:

- inizializzare variabili;
- gestire login;
- preparare ambiente;
- invocare web service;
- costruire navigation bar;
- configurare subfile;
- registrare `pui.genie.afterInit`.

### pui.genie.afterInit

Responsabilità:

- completare ambiente;
- costruire header;
- costruire body;
- costruire footer;
- eseguire `redraw()`;
- nascondere/rimuovere elementi inutili;
- impostare menu principale;
- configurare notifiche.

---

## 11. Workstation ID

`initial.js` gestisce il parametro `workstnid`.

Nel caso analizzato, la configurazione usa:

```js
workstationIdType: '*RANDOM'
workstationIdTypeRandomPrefix: 'FLA1GN'
```

Il codice genera un ID casuale, lo inserisce nella query string e ricarica la pagina se necessario.

Punti tecnici delicati:

- evitare loop di redirect;
- rispettare `fixWorkstnid`;
- gestire `suffixid`;
- mantenere lunghezza coerente dell'ID;
- verificare che la configurazione Genie sia di tipo `connectionType = "V"`.

---

## 12. Motore di redraw

Il redraw è il cuore tecnico della personalizzazione.

Pipeline logica consigliata:

```text
read -> classify -> map -> transform -> render -> enhance -> cleanup -> debug
```

Significato:

| Fase | Descrizione |
|---|---|
| read | Lettura DOM generato da Genie |
| classify | Classificazione schermata, programma, lista, dettaglio, finestra |
| map | Costruzione mappe strutturate dei campi |
| transform | Decisione del layout moderno |
| render | Creazione HTML custom |
| enhance | Applicazione dropdown, classi, stili, listener |
| cleanup | Rimozione elementi inutili |
| debug | Log e salvataggio dati diagnostici |

La funzione `redraw()` deve rispettare un ordine molto preciso, perché molte funzioni successive dipendono dal DOM generato da quelle precedenti.

---

## 13. Attributi Genie da preservare

Gli attributi Genie sono fondamentali per capire origine e ruolo dei campi.

Attributi importanti:

```text
fmtname
fmtfilename
fldid
fldname
fldtype
flduse
fldrow
fldcolumn
fldlength
fldislist
fldisexpand
fldismessage
```

Questi attributi devono essere preservati quando si spostano o si wrappano elementi.

Se un input perde ID o attributi originali, può smettere di funzionare con Genie.

---

## 14. Gestione subfile

Le subfile 5250 vengono trasformate in tabelle HTML moderne.

Funzioni principali:

```js
redrawProgramAppCoreList()
buildSubfileTbody()
mergeSubfileDetailRows()
getDetailRowElements()
calculateRowOffset()
inheritAttributesSubfile()
relocateSubfileInputs()
removeNonSubfileInputsFromMap()
```

Struttura dati tipica:

```js
mapListFormatSubfile
```

Le chiavi possono contenere:

```text
formatName
subfileIndex
row
column
fieldId
```

Regola tecnica fondamentale:

> Ogni `<tr>` del `<tbody>` deve avere lo stesso numero di `<td>` degli `<th>` nel `<thead>`.

Questa regola evita:

- disallineamenti visivi;
- export errati;
- righe duplicate;
- colonne sfasate;
- parsing incoerente.

---

## 15. Detail row

Alcune subfile hanno righe principali alternate a righe dettaglio.

Esempio:

```text
Riga principale: 8, 10, 12
Riga dettaglio:  9, 11, 13
```

La skin deve identificare correttamente le detail row e unirle alla riga principale.

Punti critici:

- non interpretare righe normali come detail row;
- non duplicare intestazioni;
- non generare righe con numero celle diverso;
- calcolare correttamente l'offset;
- gestire correttamente export e paginazione.

---

## 16. Input subfile e dropdown

Gli input `.subfileOption` vengono trasformati in componenti più moderni.

Funzionalità:

- input originale preservato;
- wrapper Bootstrap;
- pulsante dropdown;
- menu opzioni;
- opzioni lette da `data-options`;
- scrittura libera;
- selezione tramite `pui.set(id, valore)`.

Regola tecnica:

> L'input Genie originale non deve essere clonato se deve restare collegato al runtime.

L'ordine di esecuzione è critico. Se un listener viene collegato prima che un redraw avanzato ricostruisca il DOM, il listener può essere perso.

---

## 17. Personalizzazioni specifiche per programma

Sono presenti ridisegni custom e advanced per programmi specifici.

Esempi:

```text
I2900LB
I2935LB
RSCNMSG
MNUGEN
CHGENV
I0644LB
ICGE011
ICGE013
I0664LB
I0403LB
```

Queste funzioni servono a gestire casi in cui il layout prodotto dal programma legacy non è trasformabile correttamente dal redraw generico.

Alcuni programmi restituiscono stringhe concatenate da working-storage, che devono essere parsate lato JavaScript.

Esempi di righe:

```text
WK-RIGA1
WK-RIGA2
WK-RIGAP
WK-RIGAT
WK-RIGAT2
```

---
## 18. Gestione classi Genie e campi hidden

Genie genera classi come:

```text
A3A
A22
A27
```

Alcune classi possono gestire visibilità, colore o stile.

Rischio:

> Rimuovere classi Genie senza preservare la visibilità può rendere visibili campi che dovevano restare nascosti.

Strategia consigliata:

1. Rilevare se il campo è hidden.
2. Salvare questa informazione.
3. Rimuovere classi Genie solo se necessario.
4. Applicare una classe custom stabile.

Esempio:

```css
.appcore-hidden-field {
  display: none !important;
}
```

oppure:

```css
.genie-hidden-preserved {
  visibility: hidden !important;
}
```

---

## 19. CSS e convenzioni

La skin usa variabili CSS e classi custom.

È consigliabile non basare il CSS applicativo su classi Genie `A*`, perché sono generate e possono cambiare significato.

Classi applicative consigliate:

```css
.appcore-hidden-field {}
.appcore-preserved-container {}
.appcore-subfile-option {}
.appcore-accessible-mode {}
.appcore-dropdown-wrapper {}
.appcore-field-debug {}
```

Le classi devono descrivere un ruolo applicativo, non una posizione temporanea nel DOM.

---

## 20. Storage

La skin utilizza:

- `localStorage` per preferenze utente;
- `sessionStorage` per informazioni runtime di sessione.

Esempi:

```js
getDataStorage("showConsoleLog", "local")
getDataStorage("company", "session")
getDataStorage("environment", "session")
getDataStorage("codeEnvironment", "session")
getDataStorage("prefixWs", "session")
```

Lo storage non deve diventare fonte primaria di logica applicativa, ma solo supporto al comportamento runtime.

---

## 21. Log e debug

La skin include un sistema di log configurabile.

Configurazioni rilevanti:

```js
showConsoleLog
sendConsoleToWs
minConsoleLevel
consoleLogPrograms
```

Il log deve poter essere attivato/disattivato senza rompere il funzionamento applicativo.

Uso consigliato:

- log mirati per programma;
- log temporanei durante debug;
- rimozione log non necessari dopo correzione;
- invio errori rilevanti a web service.

---

## 22. Notifiche, modali ed errori

La skin gestisce:

- notifiche applicative;
- toast Bootstrap;
- modali Bootstrap;
- sessione scaduta;
- sessione chiusa;
- errori legacy;
- copia dettagli errore;
- chiusura sicura finestra.

Gli observer leggono contenuti generati da Genie e li presentano in forma più chiara all'utente.

---

## 23. Export

L'export delle subfile deve rispettare:

- struttura tabellare coerente;
- stesso numero di colonne tra header e body;
- gestione detail row;
- avanzamento pagina;
- stati `segue` e `fine`;
- assenza di duplicazione della prima schermata.

Punti di controllo:

```text
tbody[detailrow]
pagina corrente
stato export
callback asincrone
redraw multipli
F16
segue/fine
```

---

## 24. Versionamento

Il file `version.js` espone la versione applicativa.

Versione rilevata:

```js
const APP_VERSION = {
  major: 1,
  minor: 0,
  patch: 2,
  label: "",
  buildDate: "2026-05-29"
};
```

La versione dovrebbe essere coerente con:

- `README.md`;
- `CHANGELOG.md`;
- tag Git;
- rilascio propagato agli ambienti superiori.

---

## 25. Punti tecnici critici rilevati

Durante l'analisi sono emersi alcuni punti da verificare:

1. In `initial.js`, la condizione `if (o.status = 200)` sembra un'assegnazione invece di un confronto.
2. In `properties.js`, la condizione su `NEXTALIA-GEN-TST.TREBIGEN.COM` appare duplicata.
3. In `themeColor.css`, la variabile `--bs-color-material-6e00` sembra un refuso.
4. In `start.html`, `storage.js` risulta incluso due volte.
5. Artefatti come `.git`, `.vscode` e `Thumbs.db` non dovrebbero essere distribuiti negli ambienti superiori.
6. La codifica dei testi accentati va verificata.
7. L'ordine tra redraw generale, redraw advanced e collegamento listener dropdown è delicato.
8. La rimozione delle classi Genie `A*` può esporre campi hidden.
9. La gestione detail row può causare righe duplicate o colonne disallineate.
10. La costruzione URL web service deve evitare doppia concatenazione della base URL.

---

## 26. Checklist tecnica di debug

Per problemi su campo, subfile o programma:

1. Salvare HTML prima del redraw.
2. Salvare HTML dopo il redraw.
3. Identificare ID campo problematico.
4. Verificare attributi Genie.
5. Controllare se l'elemento è stato spostato, clonato o rimosso.
6. Verificare classi `A*`.
7. Controllare `display` e `visibility`.
8. Controllare numero `<td>` rispetto agli `<th>`.
9. Verificare presenza di `detailrow`.
10. Controllare ordine di esecuzione delle funzioni.
11. Verificare listener collegati.
12. Controllare eventuali redraw custom successivi.
13. Aggiungere log mirati.
14. Rimuovere log temporanei dopo la diagnosi.

---

## 27. Direzione tecnica consigliata

Per stabilizzare ulteriormente la skin è consigliato:

- separare funzioni generiche da personalizzazioni programma;
- documentare esplicitamente l'ordine del redraw;
- ridurre side effect nascosti;
- centralizzare applicazione di `fldClass` e `fldStyle`;
- preservare sempre input e attributi Genie;
- usare classi CSS applicative stabili;
- evitare dipendenza diretta da classi Genie `A*`;
- rafforzare gestione detail row;
- migliorare export;
- mantenere changelog aggiornato;
- rimuovere artefatti di sviluppo prima dei rilasci;
- usare Git tag per ogni rilascio significativo.

---

## 28. Sintesi tecnica

La personalizzazione `Iris_TRB00159` è un framework JavaScript/CSS sopra Profound UI Genie.

Il valore tecnico della soluzione sta nella capacità di trasformare una videata 5250 in un'interfaccia moderna mantenendo invariato il contratto con Genie e con il backend IBM i.

La complessità principale non è soltanto grafica, ma riguarda:

- preservazione degli input originali;
- ordine delle trasformazioni;
- gestione subfile;
- gestione detail row;
- integrazione web service;
- compatibilità tra ambienti;
- gestione dei campi hidden;
- export coerente;
- rilascio controllato.
