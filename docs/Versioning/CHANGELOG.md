# Changelog

Tutte le modifiche rilevanti della skin Genie AppCore sono documentate qui.


## [1.0.6] - 2026-10-23
### Added - Gestione multilingua su CHGENV00MPO

Multilingua su menu inizale.

## [1.0.5] - 2026-09-14
### Fixed - Gestione F4/F6 campi List/Expand

Corretta la logica di determinazione delle azioni F4/F6 utilizzate dai pulsanti dinamici.

La precedente gestione si basava principalmente sul valore visualizzato dal campo (`<` / `>`), risultando non corretta per alcuni programmi 5250 non perfettamente allineati allo standard.

La nuova logica considera congiuntamente:
- `fldislist`
- `fldisexpand`
- `flduse`
- valore corrente del campo

In particolare:
- i campi List vengono associati a F4 quando previsto;
- i campi Expand valorizzati vengono associati a F6;
- vengono gestiti correttamente i campi che espongono contemporaneamente List ed Expand;
- `doF4` e `doF6` sono ora mutuamente esclusivi;
- mantenuta la trasformazione grafica dei valori speciali `<` e `>`.

La modifica consente di gestire correttamente anche programmi 5250 fuori standard senza introdurre eccezioni specifiche per singolo programma.

## [1.0.4] - 2026-08-28
### Fixed `layerInfo.width`

File modificati:
- `js/core/window.js`
- `js/core/custom.js`

La finestra sintetica creata da `createWindowFromColons()` usa gli identificativi
riservati `window1` e `_W1`. Ora riceve anche la struttura `layerInfo` attesa da
Genie, con dimensioni espresse in righe e colonne 5250.

La finestra viene contrassegnata tramite `data-custom-synthetic-window` e rimossa
da `resetWindow()` prima del rendering successivo. Il controllo aggiuntivo su
`layerInfo == null` elimina anche eventuali finestre sintetiche rimaste nel DOM
dalla versione precedente.

## [1.0.3] - 2026-06-25
### Added
- Gestione logo AppCore.

## [1.0.2] - 2026-05-29
### Fixed
- Correzioni info società.

## [1.0.1] - 2026-05-29
### Fixed
- Correzioni funzione ExportTable.

## [1.0.0] - 2026-05-21
### Added
- Prima versione ufficiale della skin.
- Gestione menu Info Applicativo.
- Visualizzazione versione applicativo.
- Gestione dropdown subfile.
- Gestione impostazioni utente.
### Changed
- Migliorata struttura header.
- Migliorata gestione offcanvas informazioni.
### Fixed
- Correzioni su label e campi hidden.