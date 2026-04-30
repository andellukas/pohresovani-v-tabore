# Pohřešovaná osoba – Tábor a okolí

Statická offline-first PWA aplikace pro krizovou pomoc při pohřešování osoby v Táboře a okolí.

## Účel aplikace

Aplikace pomáhá blízkým a koordinátorům rychle:

- vyhodnotit riziko pohřešování,
- zavolat správné krizové kontakty,
- shromáždit údaje o pohřešované osobě,
- vytvořit text pro Policii ČR, Czech SAR Team, Facebook a leták,
- koordinovat dobrovolníky,
- evidovat prohledané oblasti,
- zapisovat tipy a časovou osu.

Aplikace opakovaně zdůrazňuje, že se nečeká 24 ani 48 hodin a že postup je nutné koordinovat s Policií ČR.

## Jak spustit lokálně

1. Stáhněte nebo rozbalte složku aplikace.
2. Otevřete soubor `index.html` v prohlížeči.
3. Aplikace funguje bez backendu, bez API klíčů a bez externích knihoven.

Poznámka: Service worker se kvůli pravidlům prohlížeče neregistruje při otevření přes `file://`. Lokální formuláře, ukládání do `localStorage`, generátory textů a tisk fungují i tak. Pro plné PWA chování spusťte aplikaci přes lokální server nebo GitHub Pages.

## Jak nasadit na GitHub Pages

1. Vložte všechny soubory do repozitáře.
2. V nastavení GitHub Pages vyberte větev a složku, odkud se má web publikovat.
3. Po nasazení otevřete veřejnou URL.
4. Po prvním načtení se statické soubory uloží do cache service workeru.

## Offline režim

Soubor `sw.js` používá cache-first strategii pro statické soubory:

- `index.html`
- `styles.css`
- `app.js`
- `data.js`
- `offline.html`
- `manifest.webmanifest`

Při nedostupnosti internetu vrací fallback `offline.html`, pokud není dostupná požadovaná stránka z cache.

## Jaká data se ukládají

Data se ukládají pouze v prohlížeči konkrétního zařízení pomocí `localStorage`:

- odpovědi v krizovém rozcestníku,
- checklist,
- formulář pohřešované osoby,
- koordinátor a dobrovolníci,
- oblasti pátrání,
- tipy a svědectví,
- časová osa.

Aplikace neposílá žádná data na server. Zařízení proto může obsahovat citlivá data. V aplikaci je tlačítko pro smazání všech uložených dat.

## Důležité právní a bezpečnostní upozornění

Aplikace nenahrazuje Policii ČR ani složky IZS. V akutní situaci volejte Policii ČR 158. Při dítěti, seniorovi, zdravotním riziku, dopisu na rozloučenou nebo sebevražedném riziku volejte 158 ihned.

Postup koordinujte s Policií ČR. Neorganizujte chaotické pátrání, které může znehodnotit pachové nebo jiné stopy.

## Kontakty

Kontakty uvedené v aplikaci vycházejí ze zadání projektu. Je nutné je pravidelně ověřovat, protože telefonní čísla, dostupnost služeb a kompetence organizací se mohou změnit.
