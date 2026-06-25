## 1. Obiettivo del progetto

Il progetto riguarda la personalizzazione di una skin **Profound UI / Genie** per modernizzare videate **IBM i / AS400 5250** senza modificare i programmi COBOL/RPG sottostanti.

L'obiettivo principale è trasformare dinamicamente l'HTML generato da Genie in un'interfaccia più moderna, leggibile e usabile, mantenendo la compatibilità con la logica 5250 originale.

La skin lavora su videate generate da programmi legacy, intercettando il DOM prodotto da Genie e riorganizzandolo tramite JavaScript, CSS, Bootstrap e chiamate a web service applicativi.

---

## 2. Contesto tecnologico

### Stack principale

- **IBM i / AS400**
- **5250 / programmi COBOL legacy**
- **Profound UI / Genie**
- **JavaScript vanilla**
- **Bootstrap**
- **HTML/CSS custom**
- **Web service applicativi** per recuperare metadati sui campi
- **LocalStorage / SessionStorage** per preferenze utente e configurazioni runtime
- **Git** per versionamento della skin
- **Beyond Compare** per propagare modifiche tra ambienti

### Ambienti citati

Gli ambienti seguono una logica di rilascio progressiva, ad esempio:

```text
customer_userName -> customer_SVL -> customer_COL -> customer_UAT -> customer_PRD
```

L'ambiente personale di sviluppo dell'utente è spesso indicato come:

```text
customer_userName
```

La produzione è indicata come:

```text
customer_PRD
```

Le modifiche vengono sviluppate nella skin personale e poi propagate con Beyond Compare verso gli ambienti superiori.

---

## 3. Filosofia architetturale

Il progetto non modifica i programmi legacy. La logica è:

1. Genie genera la videata 5250 in HTML.
2. La funzione `redraw` intercetta la videata.
3. Il codice JavaScript legge gli elementi originali generati da Genie.
4. Gli elementi vengono classificati tramite attributi come `fmtname`, `fldname`, `fldrow`, `fldcolumn`, `flduse`, ecc.
5. La videata viene ricostruita in layout moderni, ad esempio tabelle Bootstrap, container, input-group, dropdown, modali e toast.
6. I campi originali vengono preservati quando necessario, perché devono continuare a dialogare con Genie e con il runtime 5250.

Principio fondamentale:

> Non rompere il collegamento tra elemento HTML originale e campo 5250.

Per questo motivo, quando possibile, gli input originali non devono essere clonati ma spostati, wrappati o arricchiti.

---

## 4. Funzione centrale: `redraw`

La funzione `redraw` è il punto di ingresso principale della personalizzazione.

Responsabilità principali:

- Creare il contenitore custom `#container5250Custom`.
- Verificare se la videata è già customizzata tramite `pui.genie.isCustomized`.
- Eseguire eventuali personalizzazioni specifiche tramite `redrawCustomized()`.
- Determinare se il programma deve essere trattato come lista, dettaglio o finestra.
- Invocare le funzioni specializzate:
  - `redrawProgramAppCoreList()`
  - `redrawProgramAppCoreDetail()`
  - `redrawWindowAppCore()`
- Gestire videate con paginazione, stati `segue` / `fine`, subfile e finestre.

La funzione `redraw` è molto sensibile all'ordine delle chiamate. Alcune funzioni devono essere eseguite prima o dopo il ridisegno, soprattutto quelle che modificano input, dropdown o elementi rimossi dal DOM.

---

## 5. Gestione subfile

Una parte centrale del progetto è la trasformazione delle subfile 5250 in tabelle HTML moderne.

### Funzioni principali coinvolte

- `redrawProgramAppCoreList()`
- `buildSubfileTbody()`
- `mergeSubfileDetailRows()`
- `getDetailRowElements(mapListFormatSubfile)`
- `calculateRowOffset(mapListFormatSubfile)`
- `inheritAttributesSubfile()`
- `relocateSubfileInputs(mapListFormatSubfile)`
- `removeNonSubfileInputsFromMap(mapList)`

### Struttura dati principale

Viene usata una mappa denominata spesso:

```js
mapListFormatSubfile
```

Le chiavi seguono una convenzione simile:

```text
${formatNameId}_${subfileIndex}_${field.row}_${field.col}
```

Oppure:

```text
list_<id>_<index>_<row>_<col>
```

I valori contengono informazioni strutturate sul campo, ad esempio:

```js
{
  fieldInfo: {
    id,
    row,
    col,
    fldname,
    flduse,
    fldtype,
    fldlength,
    fmtname,
    fmtfilename,
    isInput,
    isOutput,
    isList,
    isExpand,
    isMessage
  }
}
```

---

## 6. Righe di dettaglio nelle subfile

Alcuni programmi AS400 generano subfile con righe principali alternate a righe di dettaglio.

Esempio:

```text
Riga principale: 8, 10, 12, ...
Riga dettaglio:  9, 11, 13, ...
```

L'obiettivo è trasformare le righe di dettaglio in colonne aggiuntive o informazioni estese sulla stessa riga principale.

### Logica importante

La funzione:

```js
getDetailRowElements(mapListFormatSubfile)
```

serve a identificare quali elementi appartengono alle righe di dettaglio.

La funzione:

```js
mergeSubfileDetailRows()
```

usa questa logica per aggregare i dettagli nella riga principale.

### Problema ricorrente

In alcuni casi, dalla seconda riga in poi, la logica può interpretare erroneamente una riga normale come `detailrow`. Questo causa:

- intestazioni duplicate o errate;
- colonne disallineate;
- righe duplicate;
- prima schermata duplicata durante export o paginazione.

È importante verificare sempre:

- numero di celle `<td>` rispetto agli `<th>`;
- presenza dell'attributo `detailrow` sul `tbody`;
- offset calcolato da `calculateRowOffset()`;
- struttura effettiva delle righe rispetto alla prima riga utile.

---

## 7. Regola di allineamento tabella

Le tabelle generate devono sempre rispettare questa regola:

> Ogni riga `<tr>` del `<tbody>` deve avere lo stesso numero di celle `<td>` delle intestazioni `<th>` nel `<thead>`.

Anche se una cella è vuota, deve essere comunque generata.

Questo evita disallineamenti visivi e problemi con:

- Bootstrap table;
- esportazione CSV/Excel;
- righe dettaglio;
- parsing custom;
- ridimensionamento colonne.

---

## 8. Input subfile e dropdown

Gli input `.subfileOption` sono campi interattivi nelle subfile.

L'obiettivo è trasformarli in componenti Bootstrap con:

- input originale mantenuto;
- bottone a destra;
- dropdown menu;
- opzioni recuperate da web service;
- scrittura libera;
- chiamata a `pui.set(id, valore)` alla selezione.

### Funzioni e concetti principali

- `enhanceSubfileInputs()`
- `.subfileOption`
- `input-group`
- `dropdown-menu`
- `pui.set(id, valore)`
- attributo `data-options`

### Regola importante

Gli input originali non devono essere clonati se devono continuare a funzionare con Genie. Devono essere arricchiti o wrappati.

### Problema ricorrente

L'ordine di esecuzione è fondamentale.

È stato osservato che, in alcuni casi, se `enhanceSubfileInputs()` viene chiamata prima di `redrawAdvanced_I0644LB()`, il listener del bottone funziona; se viene chiamata dopo, può non funzionare correttamente.

Questo indica che alcune funzioni di redraw ricreano o spostano il DOM, invalidando listener già collegati.

---

## 9. Web service BGNIDSPF e metadati campi

Il progetto utilizza una chiamata web service per ottenere informazioni sui campi e sulle opzioni disponibili.

### Funzioni principali

- `invokeWebService_BGNIDSPF()`
- `handleResponse_BGNIDSPF()`
- `groupOptionsByFieldId()`
- `modifyElem()`

### Dati gestiti

Il web service restituisce metadati come:

- opzioni disponibili per un campo;
- codice opzione;
- descrizione opzione;
- `fldClass`;
- `fldStyle`;
- attributi associati al campo;
- identificativo campo;
- formato record.

### Opzioni campo

Le opzioni vengono raggruppate per `optFldId` tramite:

```js
groupOptionsByFieldId()
```

Poi vengono inserite negli elementi tramite attributo:

```html
data-options="[...]"
```

Queste opzioni vengono usate per popolare menu dropdown ordinabili per codice o descrizione.

---

## 10. Gestione `fldClass` e `fldStyle`

Il web service può restituire attributi custom:

```text
fldClass
fldStyle
```

L'obiettivo è applicarli agli elementi generati, ad esempio:

```text
fldStyle = "min-width:14rem"
```

oppure classi CSS applicative per controllare:

- larghezza campi;
- allineamento;
- visibilità;
- stile specifico per label/input;
- layout responsivo.

### Punto delicato

La funzione di applicazione deve funzionare sia per:

- label;
- input;
- wrapper `.col`;
- wrapper `.input-group`;
- campi in subfile;
- campi in dettaglio.

Una possibile funzione concettuale è:

```js
applyFldClassAndStyle(fieldElement, wrapperElement)
```

ma il punto di invocazione deve essere scelto con attenzione per non applicare lo stile troppo presto o sull'elemento sbagliato.

---

## 11. Gestione campi nascosti e classi Genie

Genie genera classi come:

```text
A3A, A22, A27, ...
```

Alcune classi contengono informazioni di stile, colore o visibilità.

La funzione:

```js
removeBasicClass()
```

rimuove classi generate da Genie che iniziano con `A`.

Esempio:

```js
function removeBasicClass() {
  document.querySelectorAll('div, input').forEach(el => {
    const toRemove = Array.from(el.classList).filter(cls => cls.startsWith('A'));
    if (toRemove.length) el.classList.remove(...toRemove);
  });
}
```

### Problema importante

Alcune classi Genie gestiscono la visibilità, per esempio campi hidden. Se si rimuove la classe senza preservare la visibilità, campi che dovrebbero restare nascosti possono diventare visibili.

### Regola consigliata

Prima di rimuovere classi Genie, determinare se l'elemento è nascosto tramite:

- `visibility: hidden`;
- `display: none`;
- classe Genie che produce hidden;
- attributi specifici del campo;
- testo `*HIDDEN`;
- `flduse` o metadati ricevuti.

Poi applicare una classe custom, ad esempio:

```css
.genie-hidden-preserved {
  visibility: hidden !important;
}
```

oppure:

```css
.appcore-hidden-field {
  display: none !important;
}
```

A seconda del comportamento desiderato.

---

## 12. Rimozione container e righe istruttive

Il progetto include logiche per rimuovere container non necessari o composti solo da label.

### Funzioni principali

- `removeUnusedContainer()`
- `isOnlyLabelFieldsForFormatName()`
- `removeUnpreservedContainer(rowStart, mapFormatDetail)`
- `removeInstructionalRows()`
- `isFieldValidAfterInstruction(el, row, rowStart)`

### Regola importante

`removeUnpreservedContainer()` deve preservare i container `container5250_*` contenuti in blocchi `div.recordTypeD` quando necessario.

La funzione `isFieldValidAfterInstruction()` è stata integrata sia in `removeInstructionalRows` sia in `removeUnpreservedContainer` per preservare campi validi dopo l'inizio delle istruzioni.

---

## 13. Programmi custom e parsing righe

Alcuni programmi richiedono trasformazioni specifiche perché il COBOL restituisce stringhe concatenate in working-storage.

### Programmi citati

- `ICGE011`
- `ICGE013`
- `I0644LB`

### Esempi di righe COBOL

- `WK-RIGA1`
- `WK-RIGA2`
- `WK-RIGAP`
- `WK-RIGAT`
- `WK-RIGAT2`

### Obiettivo

Dividere una stringa unica in colonne significative lato JavaScript.

Esempio concettuale:

```js
parseRiga_ICGE011(rawText)
```

Le funzioni avanzate come:

```js
redrawAdvanced_ICGE011()
redrawAdvanced_ICGE013()
redrawAdvanced_I0644LB()
```

servono a trasformare specifici programmi in tabelle più leggibili.

### Requisito visivo

Le righe possono essere colorate o evidenziate in base al tipo rilevato, ad esempio:

- `rigaT`
- `rigaT2`
- `riga1`
- `rigaP`

---

## 14. Header, sidebar e informazioni ambiente

Il progetto personalizza anche header e sidebar.

### Elementi citati

- `#containerHeader`
- `#containerHeaderMajor`
- `#containerHeaderLeft`
- `#containerHeaderCenter`
- `#insideHeaderButtons`
- `#containerSideBar`
- `#sideBar`
- `#sideBarCompany`
- `#ulMenuInfoItems`

### Storage

Vengono usati valori salvati in storage, ad esempio:

```js
getDataStorage("company", "session")
getDataStorage("environment", "session")
getDataStorage("codeEnvironment", "session")
```

### Problema ricorrente

Se un elemento come `sideBarCompany` esiste ma il testo non si aggiorna, verificare:

- che l'elemento sia presente al momento dell'esecuzione;
- che `getDataStorage("company", "session")` restituisca valore;
- che la funzione venga chiamata dopo la creazione della sidebar;
- che altri redraw non riscrivano successivamente il contenuto;
- che non ci siano più elementi con ID duplicato.

---

## 15. Menu informazioni applicativo

La funzione:

```js
populateMenuInfoItems()
```

gestisce voci nel menu informativo.

Funzionalità integrate o richieste:

- mostrare versione applicativo;
- voce `Log Console` con switch;
- salvataggio preferenza in `localStorage`;
- sostituzione label trasparenti con `fldname`;
- apertura del changelog alla pressione della versione applicativo.

---

## 16. Versionamento applicativo

Il progetto usa versionamento semantico standard:

```text
MAJOR.MINOR.PATCH
```

Esempio:

```text
1.0.0
```

### File coinvolti

- `version.js`
- `README.md`
- `CHANGELOG.md`

### Percorso changelog indicato

```text
\\Mtcnsl02\pcserver\SymLnkPUI\Genie\FLA1PUITST\htdocs\profoundui\userdata\genie skins\customer_userName\docs\Version\CHANGELOG.md
```

### Obiettivo

Cliccando sulla versione applicativo nel menu Info deve aprirsi una modale con il contenuto del `CHANGELOG.md`.

---

## 17. Console log dinamica

Il progetto include una gestione avanzata della console.

### File citato

```text
console.js
```

### Funzionalità

- Abilitazione/disabilitazione log da proprietà.
- Controllo tramite `properties.showConsoleLog`.
- Livelli minimi di log.
- Filtri per programma.
- Pilotaggio da URL.
- Pilotaggio per utente da URL.
- Salvataggio preferenze.

### Concetto

Se `showConsoleLog` è `false`, i log applicativi non devono essere emessi, ma il codice non deve andare in errore.

---

## 18. Toast Bootstrap

Il progetto usa toast Bootstrap per notifiche non invasive.

### Elementi citati

- `#containerToast`
- `#D_24_2`
- `#containerEmulatorInsideHeader`

### Requisito

Il contenitore toast deve essere sovrapposto a `#D_24_2`, sempre visibile sopra `#containerEmulatorInsideHeader`, posizionato in alto a destra dello schermo.

### Uso tipico

Dopo click su icone, ad esempio `iconSnapshot`, mostrare un messaggio in basso a destra o in posizione configurata:

```text
Operazione avvenuta correttamente
```

---

## 19. Export subfile

Il progetto include una funzione di export, ad esempio:

```js
window.generateExport = function generateExport(marker) { ... }
```

### Requisito specifico

Alla prima esecuzione bisogna verificare se esiste l'attributo `detailrow` su `tbody`.

Da quel momento in poi, ad ogni cambio pagina, se il `detailrow` atteso non è presente, la funzione deve eseguire `F16`.

### Problema osservato

In alcuni test sembrava duplicare la prima schermata durante l'export.

Possibili cause:

- stato export non aggiornato correttamente;
- pagina già acquisita ma rieseguita;
- `detailrow` rilevato/non rilevato in modo incoerente;
- gestione errata di `segue` / `fine`;
- callback asincrone o redraw multipli.

---

## 20. Costruzione URL web service

La funzione:

```js
buildWebServiceUrl(url, forcedEnv = null)
```

gestisce la costruzione dell'URL finale dei web service.

### Variabili rilevanti

- `environment`
- `forcedEnv`
- `codeEnvironment`
- `baseEnvironmentWs`
- `wsParamConfigs`
- `isPublicIP`
- `getBaseWsUrl()`

### Regola importante

Se l'infrastruttura è produzione ma l'ambiente applicativo non è `PRD`, il web service deve essere forzato verso TEST.

Esempio concettuale:

```js
if (baseEnvironmentWs === "PRODUZIONE" && environment && environment !== "PRD") {
  // usa configurazione TEST
}
```

### Problema ricorrente

Attenzione a non concatenare due volte la base URL.

Se `url` contiene già una base completa, bisogna estrarre solo il nome servizio oppure normalizzare l'URL prima della concatenazione.

---

## 21. Accessibilità e Legge Stanca

È stato analizzato il tema dell'accessibilità in relazione alla normativa italiana, spesso indicata come Legge Stanca.

### Obiettivo

Capire se Genie può essere una soluzione per rendere più accessibili le videate AS400.

### Approccio consigliato

Genie può aiutare perché permette di trasformare interfacce 5250 in HTML più moderno e accessibile, ma è necessario intervenire sulla skin.

### Possibili interventi nella skin

- Aggiungere `aria-label` ai campi senza label visibile.
- Collegare label e input tramite `for` e `id`.
- Migliorare ordine di tabulazione.
- Evitare campi nascosti leggibili da screen reader.
- Aggiungere modalità accessibile attivabile da menu.
- Migliorare contrasto colori.
- Rendere bottoni e dropdown navigabili da tastiera.
- Usare ruoli ARIA solo quando necessario.
- Garantire messaggi errore leggibili da screen reader.

### Concetti discussi

- `aria-label`
- screen reader
- trasformazione della skin
- modalità accessibile
- requisiti minimi
- documentazione Confluence
- comunicazione a colleghi

---

## 22. AI integrata in Genie

È stato discusso come inserire funzionalità AI in Genie.

### Possibili casi d'uso

- Assistente contestuale nella skin.
- Spiegazione dei campi 5250.
- Suggerimenti su opzioni disponibili.
- Help dinamico per programma corrente.
- Analisi errori e messaggi AS400.
- Generazione riepiloghi della videata.
- Ricerca documentale.
- Supporto operativo per utenti.
- Navigazione intelligente IFS.

### Possibile architettura

1. Bottone AI nella UI Genie.
2. Raccolta contesto videata:
   - programma;
   - formato;
   - campi visibili;
   - valori correnti;
   - messaggi errore;
   - utente/ambiente se consentito.
3. Invio a backend aziendale.
4. Chiamata a modello AI.
5. Risposta mostrata in modale, sidebar o chat embedded.

### Attenzione

Non inviare dati sensibili o produttivi direttamente a servizi esterni senza policy aziendale, controllo privacy e autorizzazioni.

---

## 23. Navigazione IFS da Genie

È stato discusso il desiderio di navigare l'IFS IBM i da Genie.

### Obiettivo

Creare un'interfaccia web che permetta di visualizzare cartelle e file IFS come un file manager.

### Approccio consigliato

- Creare un servizio backend su IBM i o application server.
- Esporre API per:
  - lista directory;
  - download file;
  - upload file;
  - lettura file;
  - cancellazione/spostamento se autorizzato.
- Creare UI Genie con albero cartelle e tabella file.
- Gestire autorizzazioni IBM i lato backend.

---

## 24. Git e gestione rilasci

Il progetto usa Git per versionare la skin.

### Obiettivo

Gestire modifiche, rilasci e ripristini senza perdere codice in produzione.

### Principi discussi

- Sviluppare nella propria skin personale.
- Committare ogni modifica significativa.
- Usare tag per versioni rilasciate.
- Propagare agli ambienti superiori con Beyond Compare.
- Non lavorare direttamente su produzione.
- Usare Git come storico e punto di ripristino.

### Caso collega con ambiente personale

Se un collega ha una propria skin, ad esempio:

```text
customer_nomeCollega
```

le sue modifiche restano separate da quelle in `customer_userName`, salvo merge/copia manuale o repository condiviso.

È consigliabile definire una strategia comune:

- repository centralizzato;
- branch personali;
- pull request o merge controllati;
- tag per rilasci;
- changelog aggiornato.

---

## 25. Regole pratiche importanti

### Non clonare input Genie se devono restare interattivi

Preferire:

- spostamento;
- wrapping;
- arricchimento;
- mantenimento ID originale.

### Attenzione all'ordine delle funzioni

Molti problemi derivano dal fatto che una funzione modifica il DOM dopo che un'altra ha già collegato eventi o calcolato layout.

### Conservare sempre metadati campo

Attributi come questi sono fondamentali:

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

### Evitare ID duplicati

Genie e le funzioni custom devono mantenere ID univoci.

### Debug mirato

Quando un problema riguarda una cella o input specifico, concentrarsi sull'ID, ad esempio:

```text
I_11_39
D_2_37
D_7_4
```

Analizzare:

- HTML prima del redraw;
- HTML dopo il redraw;
- classi originali;
- stile computato;
- attributi Genie;
- wrapper creati;
- eventuali rimozioni.

---

## 26. Pattern consigliato per debug

Per problemi complessi, usare sempre questa sequenza:

1. Salvare HTML prima del redraw.
2. Salvare HTML dopo il redraw.
3. Identificare ID campo problematico.
4. Verificare se l'elemento è stato rimosso, clonato o spostato.
5. Verificare se ha perso attributi Genie.
6. Verificare se classi `A*` rimosse contenevano stile importante.
7. Verificare se Bootstrap ha modificato layout o larghezze.
8. Verificare se listener sono stati collegati prima o dopo il redraw.
9. Controllare se la funzione custom specifica del programma interviene dopo la funzione generale.
10. Inserire `consoleLog` mirati e rimovibili.

---

## 27. Convenzioni CSS

Il CSS custom deve evitare di dipendere direttamente dalle classi `A*` generate da Genie.

Meglio introdurre classi applicative stabili, ad esempio:

```css
.appcore-hidden-field {}
.appcore-preserved-container {}
.appcore-subfile-option {}
.appcore-accessible-mode {}
.appcore-dropdown-wrapper {}
.appcore-field-debug {}
```

Le classi devono descrivere il ruolo applicativo, non la posizione temporanea nel DOM.

---

## 28. Convenzioni JavaScript

### Preferire funzioni piccole

La funzione `redrawProgramAppCoreList` è stata oggetto di refactoring perché troppo grande.

Conviene suddividerla per responsabilità:

- lettura campi;
- costruzione mappa;
- costruzione header;
- costruzione body;
- gestione detail rows;
- gestione input;
- cleanup DOM;
- applicazione attributi;
- post-processing Bootstrap.

### Evitare side effect nascosti

Ogni funzione dovrebbe chiarire se:

- legge il DOM;
- modifica il DOM;
- rimuove elementi;
- sposta elementi;
- collega eventi;
- aggiorna storage;
- chiama web service.

---

## 29. Punti delicati noti

1. Campi hidden che riappaiono dopo rimozione classi Genie.
2. Label associate alla colonna sbagliata nelle subfile.
3. Righe dettaglio interpretate male.
4. Celle `<td>` non allineate agli `<th>`.
5. Dropdown che non funzionano dopo redraw avanzati.
6. Base URL web service duplicata.
7. Sidebar aggiornata prima che l'elemento esista.
8. Export che duplica la prima schermata.
9. Container rimossi anche quando contengono campi da preservare.
10. Stili Bootstrap che troncano label o alterano layout.
11. Differenze tra ambiente personale, SVL, COL, UAT e PRD.

---

## 30. Direzione futura consigliata

### Stabilizzare architettura

- Separare funzioni generiche da personalizzazioni programma.
- Documentare ordine di esecuzione del redraw.
- Creare una pipeline esplicita:

```text
read -> classify -> map -> transform -> render -> enhance -> cleanup -> debug
```

### Migliorare configurabilità

- Usare web service per pilotare classi e stili.
- Usare proprietà centralizzate per abilitare/disabilitare funzioni.
- Usare localStorage/sessionStorage solo per preferenze runtime.

### Migliorare rilasci

- Versionamento semantico.
- `CHANGELOG.md` obbligatorio.
- Tag Git per ogni rilascio.
- Documento di rilascio per Beyond Compare.

### Migliorare accessibilità

- Modalità accessibile nella skin.
- ARIA label automatiche.
- Navigazione tastiera.
- Contrasto e focus visibile.

### Introdurre AI in modo controllato

- Assistente contestuale.
- Backend aziendale intermedio.
- Nessun dato sensibile inviato senza controllo.
- Log e audit delle richieste.

---

## 31. Glossario rapido

| Termine | Significato |
|---|---|
| Genie | Motore Profound UI che trasforma 5250 in HTML |
| Skin | Personalizzazione grafica/funzionale Genie |
| Subfile | Lista/tabella 5250 generata dal programma legacy |
| Detail row | Riga di dettaglio associata a una riga principale subfile |
| `fldname` | Nome campo applicativo |
| `flduse` | Uso campo: input/output/label ecc. |
| `fmtname` | Nome formato record |
| `redraw` | Funzione principale di ricostruzione UI |
| `pui.set` | Funzione Profound UI per impostare valore campo |
| BGNIDSPF | Web service/metodo usato per recuperare metadati display file |
| Beyond Compare | Strumento usato per propagare file tra ambienti |
| Legge Stanca | Normativa italiana sull'accessibilità digitale |

---

## 32. Nota finale

Questo progetto è una modernizzazione progressiva di interfacce AS400/5250 tramite skin Genie. La complessità principale non è solo grafica: riguarda il mantenimento del comportamento originale 5250 mentre si trasforma profondamente il DOM.

Ogni modifica deve quindi rispettare tre vincoli:

1. Non rompere il collegamento con Genie.
2. Non alterare la logica legacy sottostante.
3. Rendere la UI più moderna, accessibile, manutenibile e versionabile.
