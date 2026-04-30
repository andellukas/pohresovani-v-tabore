'use strict';

window.PATRANI_DATA = {
  appName: 'Pohřešovaná osoba – Tábor a okolí',
  storageKey: 'patrani_tabor_v1',
  emergencyNotice: 'Nečekejte 24 hodin. Při důvodném podezření jednejte ihned a koordinujte postup s Policií ČR.',
  questions: [
    { id: 'child', text: 'Jde o dítě?', critical: true },
    { id: 'senior', text: 'Jde o seniora?', critical: true },
    { id: 'farewellLetter', text: 'Zanechala osoba dopis na rozloučenou?', critical: true },
    { id: 'suicideTalk', text: 'Mluvila o sebevraždě?', critical: true },
    { id: 'noEssentials', text: 'Nemá mobil, doklady, peněženku nebo léky?', elevated: true },
    { id: 'unusual', text: 'Zmizela za neobvyklých okolností?', elevated: true },
    { id: 'healthRisk', text: 'Má psychické nebo zdravotní riziko?', critical: true },
    { id: 'terrainRisk', text: 'Je venku zima, noc, voda, les, skály nebo jiný terénní rizikový faktor?', elevated: true }
  ],
  checklist: [
    'Zavolat 158',
    'Připravit fotografii',
    'Připravit popis osoby',
    'Zapsat poslední známé místo a čas',
    'Zjistit oblečení',
    'Ověřit mobil, peněženku, doklady, léky',
    'Kontaktovat rodinu a přátele',
    'Prověřit dům, sklep, půdu, zahradu, okolí',
    'Neznehodnotit možné pachové stopy',
    'Kontaktovat Czech SAR Team',
    'Určit koordinátora'
  ],
  contacts: [
    { name: 'Policie ČR', phones: ['158'], note: 'Volejte ihned při důvodném podezření na pohřešování. První krok v rizikovém režimu.' },
    { name: 'Policie ČR Tábor', phones: ['974 238 111'], note: 'Místní služebna pro doplnění informací a koordinaci po nahlášení.' },
    { name: 'Czech SAR Team', phones: ['222 762 227'], note: 'Další krizový kontakt; připravte fotografii, popis, poslední místo, rizika a informaci o pachových stopách.' },
    { name: 'K9 Rescue Team', phones: ['603 210 572', '773 400 378'], note: 'K9 a terénní služby zkušených psovodů. Koordinujte s Policií ČR.' },
    { name: 'Kynologický klub Tábor', phones: ['775 043 830', '381 278 276'], note: 'Místní psovodi; vhodné řešit přes koordinátora a po dohodě s Policií ČR.' },
    { name: 'Město Tábor', phones: ['381 486 111'], note: 'Žádost o místní součinnost, rozhlas, kontakty na terénní znalce a krizové řízení.' },
    { name: 'Lesy ČR – LS Tábor', phones: ['956 197 111'], note: 'Znalost lesa a terénu v okolí. Užitečné při pátrání v lesích.' },
    { name: 'OMS Tábor', phones: ['381 253 123'], note: 'Okresní myslivecký spolek; znalost honiteb a terénu.' },
    { name: 'HZS JČK', phones: ['950 230 111'], note: 'Krajské operační středisko; zapojení řešte v koordinaci s Policií ČR/IZS.' },
    { name: 'SDH Tábor', phones: ['381 252 022'], note: 'Dobrovolní hasiči; lokální pomoc a zázemí po koordinaci.' },
    { name: 'SDH Sezimovo Ústí', phones: ['731 677 240'], note: 'Dobrovolní hasiči pro okolí Sezimova Ústí.' },
    { name: 'SDH Planá nad Lužnicí', phones: ['381 291 168'], note: 'Dobrovolní hasiči pro okolí Plané nad Lužnicí.' },
    { name: 'Linka důvěry', phones: ['284 016 666'], note: 'Psychická podpora pro blízké a osoby v akutním stresu.' }
  ],
  personFields: [
    ['fullName', 'Jméno a příjmení', 'text'],
    ['birthDate', 'Datum narození', 'date'],
    ['age', 'Věk', 'number'],
    ['height', 'Výška', 'text'],
    ['build', 'Postava', 'text'],
    ['hair', 'Barva vlasů', 'text'],
    ['clothing', 'Oblečení', 'textarea'],
    ['marks', 'Specifické znaky', 'textarea'],
    ['health', 'Zdravotní stav', 'textarea'],
    ['medication', 'Léky', 'textarea'],
    ['mentalState', 'Psychický stav', 'textarea'],
    ['suicideRisk', 'Sebevražedné riziko', 'select', ['neuvedeno', 'ne', 'ano', 'nelze vyloučit']],
    ['lastPlace', 'Poslední známé místo', 'textarea'],
    ['lastTime', 'Poslední známý čas', 'datetime-local'],
    ['direction', 'Směr odchodu', 'text'],
    ['favoritePlaces', 'Oblíbená místa', 'textarea'],
    ['contactName', 'Kontaktní osoba', 'text'],
    ['contactPhone', 'Telefon kontaktní osoby', 'tel'],
    ['notes', 'Poznámky', 'textarea']
  ],
  areaStates: ['neprohledáno', 'částečně', 'prohledáno', 'nutné znovu'],
  volunteerStates: ['čeká', 'hledá', 'hotovo', 'tip předán policii'],
  credibility: ['nízká', 'střední', 'vysoká']
};
