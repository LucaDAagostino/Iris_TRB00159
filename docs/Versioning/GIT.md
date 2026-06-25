# GIT.md

# Guida a Git - Genie AppCore

## Scopo

Questo documento descrive i principali concetti e comandi Git utilizzati
nel progetto **Genie AppCore**.

## Cos'è Git

Git è un sistema di controllo versione che permette di salvare lo
storico delle modifiche, confrontare versioni, recuperare versioni
precedenti e collaborare con altri sviluppatori.

## Concetti fondamentali

-   Repository
-   Working Directory
-   Stage
-   Commit
-   Tag

## Comandi principali

### Inizializzare un repository

``` bash
git init
```

### Verificare lo stato

``` bash
git status
```

### Visualizzare le modifiche

``` bash
git diff
```

### Preparare i file

``` bash
git add .
```

### Creare un commit

``` bash
git commit -m "Descrizione modifica"
```

### Visualizzare lo storico

``` bash
git log
git log --oneline
```

### Gestione tag

``` bash
git tag
git tag v1.0.1
```

### Repository remoto

``` bash
git remote -v
git remote add origin <URL_REPOSITORY>
git push
git pull
```

### Ripristino

``` bash
git restore .
git restore js/header.js
git reset --hard v1.0.0
git revert <commit>
```

## Flusso di lavoro

``` text
Modifica codice
↓
git status
↓
git diff
↓
git add .
↓
git commit
↓
git push
```

## Best Practice

-   Eseguire spesso git status
-   Creare commit piccoli e frequenti
-   Creare un tag per ogni rilascio
-   Aggiornare il CHANGELOG
-   Non sviluppare direttamente in produzione
