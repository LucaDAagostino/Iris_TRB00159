# Analisi funzionale - Profound Genie e personalizzazione AppCore

## 1. Scopo

Questo documento descrive dal punto di vista funzionale l'uso di Profound UI Genie per modernizzare videate IBM i / AS400 5250 e le personalizzazioni introdotte nella skin personale.

L'obiettivo e' rendere le schermate legacy piu moderne, leggibili e usabili, senza modificare i programmi COBOL/RPG sottostanti e senza rompere il collegamento tra interfaccia web e runtime 5250.

## 2. Contesto

Profound UI Genie converte una videata 5250 in HTML. La skin personalizzata interviene sul DOM generato da Genie e lo riorganizza tramite JavaScript, CSS, Bootstrap e chiamate a web service applicativi.

La soluzione non sostituisce il gestionale legacy: crea un livello di presentazione moderno sopra la videata 5250 originale.

Principio guida:

> La videata puo essere ridisegnata, ma il comportamento 5250 originale deve restare invariato.

## 3. Obiettivi funzionali

- Migliorare leggibilita e usabilita delle videate 5250.
- Trasformare subfile e liste in tabelle HTML moderne.
- Aggiungere header, sidebar, footer e informazioni ambiente.
- Arricchire input e campi con componenti Bootstrap.
- Integrare dropdown, notifiche, modali, toast, export e snapshot.
- Recuperare metadati campo tramite web service.
- Mantenere compatibilita con Genie e con i programmi legacy.
- Rendere la skin versionabile e propagabile tra ambienti.
- Preparare la soluzione ad accessibilita e funzioni AI future.

## 4. Perimetro

Rientrano nel perimetro:

- skin Profound Genie;
- JavaScript custom;
- CSS custom;
- configurazioni di skin;
- ridisegno videate;
- subfile;
- integrazione web service;
- gestione storage;
- personalizzazioni per programma.

Non rientrano nel perimetro:

- modifica dei programmi COBOL/RPG;
- modifica della logica IBM i;
- sostituzione del runtime Profound UI;
- interventi diretti in produzione senza rilascio controllato.

## 5. Flusso funzionale

1. L'utente apre Genie con la skin configurata.
2. Genie genera la videata 5250 come HTML.
3. La skin intercetta la videata nel ciclo di caricamento.
4. Il codice legge programma, formato record, campi e attributi.
5. La schermata viene classificata come menu, lista, dettaglio o finestra.
6. Il DOM viene trasformato in layout moderni.
7. Gli input originali vengono spostati o arricchiti, non clonati.
8. I web service forniscono metadati, opzioni, classi e stili.
9. L'utente lavora sulla UI modernizzata.
10. Genie continua a comunicare con il backend 5250.

## 6. Componenti funzionali

La skin introduce:

- header applicativo;
- sidebar;
- area centrale emulatore;
- header interno programma;
- body programma;
- footer con tasti funzione;
- area notifiche;
- popup e toast Bootstrap;
- modali di errore o sessione;
- menu informazioni applicativo.

## 7. Subfile

Le subfile 5250 vengono trasformate in tabelle moderne.

Funzionalmente devono garantire:

- intestazioni chiare;
- righe coerenti;
- colonne allineate;
- input preservati;
- righe dettaglio aggregate correttamente;
- paginazione coerente;
- export senza duplicazioni.

Regola essenziale:

> Ogni riga del tbody deve avere lo stesso numero di celle delle intestazioni del thead.

## 8. Input e dropdown

Gli input nelle subfile possono essere arricchiti con:

- input-group Bootstrap;
- pulsante a destra;
- menu dropdown;
- opzioni da web service;
- scrittura libera;
- selezione tramite pui.set.

Regola funzionale:

> Gli input Genie interattivi non devono essere clonati. Devono essere spostati, wrappati o arricchiti mantenendo ID e collegamento originale.

## 9. Web service

I web service aggiungono informazioni che non sono sempre presenti nel DOM 5250.

Servizi principali:

- BGNIDSPF: metadati display file, campi e opzioni.
- BGNIATTR: attributi, classi e stili applicativi.
- BGNIWMSG: messaggi e notifiche.

Queste informazioni servono a costruire dropdown, applicare stili, gestire opzioni e rendere la UI piu intelligente.

## 10. Ambienti

La soluzione distingue ambienti personali e ambienti di rilascio.

Flusso indicativo:

```text
customer_TRB00159 -> customer_SVL -> customer_COL -> customer_UAT -> customer_PRD
```

Lo sviluppo avviene nella skin personale, poi viene propagato agli ambienti superiori con controlli e confronto file.

## 11. Log, notifiche e messaggi

La skin gestisce:

- log console configurabile;
- invio errori a web service;
- notifiche non invasive;
- toast Bootstrap;
- modali di sessione scaduta o chiusa;
- errori legacy resi piu leggibili.

## 12. Versionamento

La soluzione usa versionamento semantico:

```text
MAJOR.MINOR.PATCH
```

File previsti:

- version.js;
- README.md;
- CHANGELOG.md.

La versione puo essere mostrata nel menu informazioni e collegata al changelog.

## 13. Accessibilita

La skin puo migliorare l'accessibilita delle videate 5250 con:

- aria-label automatiche;
- label collegate agli input;
- focus visibile;
- navigazione tastiera;
- contrasto colori;
- messaggi errore leggibili;
- modalita accessibile.

## 14. Evoluzioni future

Possibili sviluppi:

- assistente AI contestuale;
- spiegazione campi 5250;
- help dinamico per programma;
- analisi errori AS400;
- navigazione IFS;
- file manager web;
- miglioramento accessibilita;
- pipeline di rilascio piu strutturata.

## 15. Vincoli fondamentali

Ogni modifica deve rispettare tre vincoli:

1. Non rompere il collegamento con Genie.
2. Non alterare la logica legacy.
3. Rendere la UI piu moderna, accessibile, manutenibile e versionabile.

ANALISI_TECNICA_PROFOUND_GENIE.md
Impossibile caricare il contenuto completo del file
# Analisi tecnica - Profound Genie e personalizzazione AppCore

## 1. Scopo

Questo documento descrive tecnicamente il funzionamento di Profound UI Genie e della personalizzazione realizzata nella skin AppCore/Genie.

E' destinato a chi deve mantenere, correggere o far evolvere la skin.

## 2. Architettura

Profound UI Genie converte una videata 5250 in HTML. La skin custom interviene nel browser e trasforma il DOM generato.

Tecnologie usate:

- IBM i / AS400;
- Profound UI Genie;
- JavaScript vanilla;
- jQuery per chiamate AJAX;
- Bootstrap;
- CSS custom;
- web service applicativi;
- localStorage e sessionStorage;
- Git e Beyond Compare per rilascio.

La personalizzazione e' un layer sopra Genie: modifica la rappresentazione, ma deve preservare il contratto tecnico con il runtime 5250.

## 3. File principali

- start.html: bootstrap della skin.
- config.js: configurazione Genie.
- properties.js: proprieta applicative, ambienti, web service.
- version.js: versione applicativa.
- js/core/initial.js: inizializzazione e workstation id.
- js/core/custom.js: lifecycle principale.
- js/redraw/redraw.js: motore generale di ridisegno.
- js/redraw/redrawCustomized/*.js: customizzazioni specifiche.
- js/redraw/redrawAdvanced/*.js: ridisegni avanzati.
- js/webService/*.js: integrazione web service.
- js/utility/*.js: funzioni comuni.
- css/core/*.css: layout.
- css/look/*.css: tema e colori.
- css/redraw/*.css: stili per ridisegno.

## 4. Configurazione Genie

Parametri rilevanti in config.js:

- connectionType: "V";
- locale: "it_IT";
- defaultDateFormat: "DD/MM/YYYY";
- detectSubfile: true;
- detectSubfilePatterns: true;
- detectDateFields: true;
- detectMenus: true;
- functionKeyButtons: true;
- preventAutoTab: true;
- highlightOnFocus: true;
- enableDesigner: false.

Questi parametri abilitano il riconoscimento automatico di elementi 5250 e forniscono alla skin una base piu ricca da trasformare.

## 5. Caricamento della pagina

start.html carica:

- CSS Profound UI;
- librerie Bootstrap;
- icone;
- Flatpickr;
- Choices;
- html2canvas;
- Vanta;
- CSS della skin;
- properties.js;
- version.js;
- initial.js;
- observer;
- genie.js;
- utility;
- web service;
- redraw generale;
- redraw custom e avanzati.

L'ordine e' importante perche molte funzioni dipendono da variabili globali gia inizializzate.

## 6. Lifecycle

Funzioni principali:

- beforeLoad();
- afterLoad();
- customize();
- pui.genie.afterInit.

beforeLoad prepara ambiente, loader, lingua, dimensioni video, sidebar e contenitori.

afterLoad ferma il loader, legge programma corrente, applica font, resize e stili.

customize inizializza la skin, prepara ambiente, invoca web service, costruisce navigation bar e registra afterInit.

pui.genie.afterInit costruisce header, body, footer, esegue redraw e completa cleanup e notifiche.

## 7. Workstation id

initial.js gestisce workstnid.

La configurazione usa workstation random con prefisso:

```text
FLA1GN
```

Il codice puo aggiungere parametri in URL e fare redirect per impostare correttamente la sessione.

Punti delicati:

- evitare loop di redirect;
- rispettare fixWorkstnid;
- gestire suffixid;
- mantenere lunghezza coerente dell'id.

## 8. Pipeline redraw

Pipeline tecnica consigliata:

```text
read -> classify -> map -> transform -> render -> enhance -> cleanup -> debug
```

Significato:

- read: leggere DOM Genie originale;
- classify: capire tipo videata;
- map: costruire mappe dei campi;
- transform: decidere il layout;
- render: costruire DOM moderno;
- enhance: aggiungere dropdown, classi, stili, listener;
- cleanup: rimuovere elementi inutili;
- debug: salvare informazioni utili.

## 9. Attributi Genie da preservare

Attributi fondamentali:

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

Se un campo perde questi attributi puo non essere piu gestibile dal runtime o dalle funzioni custom.

## 10. Subfile

Funzioni coinvolte:

- redrawProgramAppCoreList();
- buildSubfileTbody();
- mergeSubfileDetailRows();
- getDetailRowElements(mapListFormatSubfile);
- calculateRowOffset(mapListFormatSubfile);
- inheritAttributesSubfile();
- relocateSubfileInputs(mapListFormatSubfile);
- removeNonSubfileInputsFromMap(mapList).

La struttura principale e' una mappa dei campi, spesso chiamata mapListFormatSubfile.

Le chiavi possono contenere formato, indice subfile, riga e colonna.

## 11. Detail row

Alcune subfile alternano riga principale e riga dettaglio.

Il redraw deve:

- identificare correttamente le detail row;
- unirle alla riga principale;
- evitare duplicazione intestazioni;
- mantenere td e th allineati;
- evitare duplicazione in export;
- gestire segue/fine.

## 12. Input e dropdown

Gli input .subfileOption vengono arricchiti con:

- wrapper Bootstrap;
- bottone;
- menu dropdown;
- data-options;
- pui.set(id, valore).

Regola tecnica:

> Non clonare input interattivi Genie. Spostarli o wrappare l'elemento originale.

L'ordine tra redraw avanzato e collegamento listener e' critico.

## 13. Web service

Funzioni e componenti:

- invokeWebService();
- buildWebServiceUrl(url, forcedEnv);
- buildWebServiceUrlCacheKey();
- localCache;
- result.callbackSuccess;
- result.callbackError;
- errorWebService.

Servizi:

- BGNIDSPF per metadati campi e opzioni;
- BGNIATTR per attributi;
- BGNIWMSG per messaggi.

## 14. Ambienti e URL

La configurazione gestisce:

- TEST;
- TEST_UAT;
- PRODUZIONE;
- rete interna;
- accesso pubblico;
- reverse proxy;
- prefisso web service;
- ambiente applicativo salvato in sessione.

Regola:

Se l'infrastruttura e' produzione ma l'ambiente applicativo non e' PRD, il web service deve puntare a TEST.

Se l'infrastruttura e' TEST ma l'ambiente applicativo e' PRD, il web service deve puntare a PRODUZIONE.

## 15. Storage

Uso previsto:

- localStorage per preferenze utente;
- sessionStorage per dati runtime di sessione.

Esempi:

```js
getDataStorage("showConsoleLog", "local")
getDataStorage("company", "session")
getDataStorage("environment", "session")
getDataStorage("codeEnvironment", "session")
getDataStorage("prefixWs", "session")
```

## 16. CSS e classi

La skin usa variabili CSS e classi custom.

Convenzione consigliata:

Non basare il CSS applicativo sulle classi Genie A*, perche sono generate e possono rappresentare stili o visibilita.

Usare classi stabili:

```css
.appcore-hidden-field {}
.appcore-preserved-container {}
.appcore-subfile-option {}
.appcore-accessible-mode {}
.appcore-dropdown-wrapper {}
.appcore-field-debug {}
```

## 17. Campi hidden

Rischio noto:

Rimuovendo classi Genie A* si possono rendere visibili campi che dovevano restare hidden.

Strategia:

1. rilevare se il campo e' hidden;
2. salvare l'informazione;
3. rimuovere classi solo se necessario;
4. applicare classe custom di preservazione.

## 18. Personalizzazioni specifiche

Sono presenti customizzazioni per programmi come:

- I2900LB;
- I2935LB;
- RSCNMSG;
- MNUGEN;
- CHGENV;
- I0644LB;
- ICGE011;
- ICGE013.

Le funzioni specifiche gestiscono casi che il redraw generale non puo interpretare in modo affidabile.

## 19. Log e debug

La skin gestisce:

- showConsoleLog;
- minConsoleLevel;
- filtri programma;
- salvataggio preferenze;
- invio errori a web service;
- log mirati.

Il codice deve restare stabile anche con log disabilitati.

## 20. Errori e modali

Gli observer gestiscono:

- sessione scaduta;
- sessione chiusa;
- errore legacy;
- modali Bootstrap;
- copia dettagli;
- chiusura sicura finestra.

## 21. Export

L'export deve controllare:

- detailrow;
- paginazione;
- stato segue/fine;
- callback;
- duplicazione pagina;
- numero colonne.

Il punto piu importante e' mantenere coerenza tra struttura visuale e dati esportati.

## 22. Rilascio tra ambienti


## 23. Punti critici da verificare

- In initial.js, `if (o.status = 200)` sembra assegnazione e non confronto.
- In properties.js, la condizione per NEXTALIA-GEN-TST sembra duplicata.
- In themeColor.css, `--bs-color-material-6e00` sembra un refuso.
- start.html include storage.js due volte.
- Artefatti come .git, .vscode e Thumbs.db non dovrebbero essere propagati.
- La codifica dei testi accentati va verificata.
- L'ordine tra redraw, redrawAdvanced e listener dropdown e' delicato.

## 24. Checklist di debug

1. Salvare HTML prima del redraw.
2. Salvare HTML dopo il redraw.
3. Identificare ID campo.
4. Controllare attributi Genie.
5. Verificare se l'elemento e' stato spostato, clonato o rimosso.
6. Controllare classi A*.
7. Controllare display e visibility.
8. Verificare td rispetto a th.
9. Verificare detailrow.
10. Controllare ordine funzioni.
11. Controllare listener.
12. Aggiungere consoleLog mirati.
13. Rimuovere log temporanei.

## 25. Sintesi tecnica

La personalizzazione e' un framework JavaScript/CSS sopra Profound Genie.

La parte piu complessa non e' il layout, ma il mantenimento del contratto tecnico con Genie mentre il DOM viene trasformato.

Le aree piu sensibili sono:

- subfile;
- input;
- detail row;
- web service;
- classi Genie;
- hidden field;
- export;
- ordine di esecuzione;
- rilascio tra ambienti.

