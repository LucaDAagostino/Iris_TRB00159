# Procedura di sviluppo e rilascio

## Sommario

1.  [Scopo](#1-scopo)
2.  [Ambienti](#2-ambienti)
3.  [Sviluppo nella skin utente](#3-sviluppo-nella-skin-utente)
4.  [Prima di modificare](#4-prima-di-modificare)
5.  [Modifica del codice](#5-modifica-del-codice)
6.  [Test nella skin utente](#6-test-nella-skin-utente)
7.  [Aggiornare la versioneapplicativa](#7-aggiornare-la-versione-applicativa)
8.  [Aggiornare il CHANGELOG](#8-aggiornare-il-changelog)
9.  [Commit Git nella skin utente](#9-commit-git-nella-skin-utente)
10. [Creare il tag della versione](#10-creare-il-tag-della-versione)
11. [Promozione verso SVL](#11-promozione-verso-svl)
12. [Promozione verso COL](#12-promozione-verso-col)
13. [Promozione verso UAT](#13-promozione-verso-uat)
14. [Promozione verso PRD](#14-promozione-verso-prd)
15. [Versionare PRD dopo il deploy](#15-versionare-prd-dopo-il-deploy)
16. [Test finale in PRD](#16-test-finale-in-prd)
17. [Rollback PRD](#17-rollback-prd)
18. [Checklist sviluppatore](#18-checklist-sviluppatore)
19. [Comandi rapidi](#19-comandi-rapidi)
20. [Regole finali](#20-regole-finali)
21. [Schema finale](#21-schema-finale)

------------------------------------------------------------------------

## 1. Scopo

Descrivere il flusso completo di sviluppo, versionamento e rilascio
della skin Genie.

## 2. Ambienti

``` text
userName → SVL → COL → UAT → PRD
```

## 3. Sviluppo nella skin utente

Sviluppare esclusivamente nella propria skin personale.

## 4. Prima di modificare

``` bash
git status
git pull
```

## 5. Modifica del codice

``` bash
git diff
```

## 6. Test nella skin utente

Verificare tutte le funzionalità interessate.

## 7. Aggiornare la versione applicativa

Aggiornare `js/version.js`.

## 8. Aggiornare il CHANGELOG

Aggiornare `docs/Version/CHANGELOG.md`.

## 9. Commit Git nella skin utente

``` bash
git status
git add .
git commit -m "Descrizione modifica"
git push
```

## 10. Creare il tag della versione

``` bash
git tag v1.0.1
git push origin v1.0.1
```

## 11. Promozione verso SVL

Deploy con Beyond Compare e test.

## 12. Promozione verso COL

Deploy e test.

## 13. Promozione verso UAT

Deploy e test.

## 14. Promozione verso PRD

Deploy con Beyond Compare.

## 15. Versionare PRD dopo il deploy

``` bash
git status
git add .
git commit -m "Deploy PRD 1.0.1"
git tag prd-1.0.1
```

## 16. Test finale in PRD

Verificare versione, funzionalità e console.

## 17. Rollback PRD

``` bash
git tag
git reset --hard prd-1.0.0
```

## 18. Checklist sviluppatore

-   [ ] Versione aggiornata
-   [ ] CHANGELOG aggiornato
-   [ ] Commit eseguito
-   [ ] Push eseguito
-   [ ] Tag creato
-   [ ] Test completati
-   [ ] Deploy completato

## 19. Comandi rapidi

``` bash
git status
git diff
git add .
git commit -m "..."
git push
```

## 20. Regole finali

-   Non sviluppare in PRD.
-   Aggiornare sempre CHANGELOG.
-   Creare un tag ad ogni release.

## 21. Schema finale

``` text
Sviluppo
 ↓
Test
 ↓
Aggiorna versione
 ↓
Aggiorna CHANGELOG
 ↓
Commit
 ↓
Push
 ↓
Tag
 ↓
SVL
 ↓
COL
 ↓
UAT
 ↓
PRD
```
