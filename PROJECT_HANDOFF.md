# MaxGym Bratislava web — stav a předání

**Aktualizováno:** 5. 9. 2026
**Veřejná lock stránka:** https://maxgym.sk/
**Pracovní náhled celého webu:** https://maxgym.sk/test/
**GitHub Pages náhled repozitáře:** https://maxgymbratislava.github.io/
**Repozitář:** `maxgymbratislava/maxgymbratislava.github.io`
**Cílová doména:** `maxgym.sk` — webhosting aktivní, automatický deploy ověřen

Tento soubor je vstupní bod pro pokračování na novém stroji. Neobsahuje hesla, API tokeny ani jiné tajné hodnoty.

## Co web představuje

MaxGym Bratislava jsou dvě samostatně rezervovatelná soukromá fitka v jedné budově:

| Veřejný název | SimplyBook služba | Stabilní `event_id` | Vstup |
|---|---|---:|---|
| MaxGym Pro | původně `Fitko 1` | `2` | jedny dveře přímo z ulice, jeden Nuki zámek a Keypad |
| MaxGym Solo | původně `Fitko 2` | `3` | dvoje dveře přes chodbu, dva Nuki zámky a Keypady; jeden PIN funguje na obou |

Názvy služeb v SimplyBook lze změnit, **číselná ID 2 a 3 se nesmějí změnit**. Backend podle nich fail-closed vybírá správnou sadu zámků.

## Technické řešení webu

- Statické HTML/CSS/JS bez frameworku a bez build kroku.
- Do ostrého spuštění je v kořeni pouze obrazová stránka
  „Už čoskoro nový MAXGYM BRATISLAVA“.
- Celý web je dočasně pod `/test/`: slovenština na `/test/`, angličtina pod `/test/en/`.
- `/test/` není chráněný heslem. Je pouze neveřejně odkazovaný a opatřený
  `robots.txt` + `noindex, nofollow`, aby jej běžně nezařazovaly vyhledávače.
- Rezervace je vložený SimplyBook iframe z `maxgymbratislava.simplybook.it`.
- Produkční nasazení běží přes GitHub Actions a SSH/rsync na Český hosting.
- Workflow je aktivní (`CH_DEPLOY_ENABLED=true`); první ruční deploy uspěl 5. 9. 2026.
- Absolutní cesty pracovního webu nyní používají prefix `/test/...`.
- Rsync řízeně odstraňuje staré soubory z přesně ověřeného webového kořene, ale
  zachovává systémovou složku `.well-known/` používanou mimo jiné pro HTTPS.
- Nepoškozené plné fotografie jsou lokálně v `source-images/`. Složka je ignorovaná
  Gitem, aby se originály nedostaly do veřejného repozitáře, a musí mít samostatnou
  soukromou zálohu. Webové kopie v `test/assets/img/` se vytvářejí skriptem
  `scripts/optimize-images.ps1` (max. 1920 px, JPEG 85, následná kontrola načtení).
- Web neobsahuje žádná tajemství. Přístupové údaje patří do password manageru, nikdy do tohoto veřejného repa.

Lokální spuštění:

```bash
cd maxgym_web
python3 -m http.server 8000
```

Na novém stroji je nutné znovu provést `gh auth login` pro účet `maxgymbratislava`;
přihlášení uložené v systémovém správci přihlašovacích údajů se kopírováním složky
nepřenese. Git lze na Windows bez administrátorských práv používat v PortableGit.

## Dočasný lock režim a pozdější spuštění

Aktuální adresářové rozložení je záměrné: veřejnost vidí pouze kořenový `index.html`,
zatímco pracovní stránky a jejich assety jsou v `test/`. Až bude obsah schválený,
v jednom commitu se obsah `test/` přesune zpět do kořene, cesty `/test/...` se změní
na `/...`, odstraní se `noindex, nofollow` a aktualizují se `robots.txt` se
`sitemap.xml`. Potom je nutné ověřit SK/EN odkazy a živý deploy.

## Vazba na rezervace a dveře

```text
web → SimplyBook → Zapier → api.maxgym.sk → MaxGym backend → Nuki → e-mail s PINem
```

- Web pouze zobrazuje SimplyBook; rezervace ani PINy sám nevytváří.
- Zapier má mít tři Zapy: new → `/code`, change → `/attenzione`, cancel → `/womp`.
- Všechny posílají hlavičku `X-Webhook-Secret` a pole `service` musí být numerické Service ID.
- Backend je v samostatném repozitáři a stále je potřeba dokončit ostré Nuki/SMTP napojení.
- Nuki hardware je k 24. 8. doma předpárovaný: 3 zámky ↔ 3 správné Keypady, bez trvalých vstupních PINů a bez kalibrace. WiFi je dočasný mobilní hotspot; majitel ji musí v Bratislavě změnit, zámky namontovat a kalibrovat.

## Audit 24. 8. 2026 — co bylo opraveno

- Odstraněna veřejná tvrzení o zaplacení, 30min booking cut-offu a 24h refundaci, protože pravidla pro BA nejsou schválená.
- Odstraněno tvrzení, že PIN technicky platí pouze během rezervace; současný backend ještě používá celodenní Nuki okno.
- Odstraněny nepotvrzené sliby o sprše, kamerovém systému, pravidelném úklidu a hygienickém vybavení.
- Opraven matoucí text „dvě fitka, dva kódy“ — Solo používá jeden kód na dvoje dveře.
- Veřejný kontakt sjednocen na hlavní adresu `maxgym@maxgym.sk`.
- Rozbitá fotografie `galerie-04.jpg` odstraněna z obou galerií; soubor zůstává v repu jen jako nepoužívaný zdroj do výměny médií.
- Používané JPEGy zmenšeny na webové rozlišení; jejich souhrnná velikost klesla přibližně z 6,5 MB na 0,7 MB.
- Doplněn favicon, theme color, EN meta descriptions, správné hlavní nadpisy `h1`, `robots.txt` a `sitemap.xml`.
- Mobilní menu nyní udržuje `aria-expanded`; galerii lze otevřít klávesnicí a zavřít tlačítkem nebo Escape.

## P0 — blokery ostrého spuštění

### SimplyBook

- Trial je expirovaný; pro dvě současně rezervovatelná fitka je potřeba nejméně dvojice providerů/kalendářů.
- Pro plný provoz je bezpečnější plán s limitem alespoň 500 rezervací/měsíc; Basic má pouze 100.
- Přejmenovat `Fitko 1` → `MaxGym Pro` a `Fitko 2` → `MaxGym Solo`, ale zachovat `event_id` 2/3.
- Opravit veřejnou dostupnost: nyní se zobrazuje Po–Pá 09:00–18:00 a víkend zavřený, zatímco cílový provoz je 24/7.
- Přepnout veřejné UI na slovenštinu a timezone na `Europe/Bratislava`.
- Sjednotit kontakt a potvrdit adresu: web používá Klincová 37; SimplyBook veřejně ukazoval Klincovu 37C a český telefon.
- Nastavit dvě nezávislé dostupnosti tak, aby šla Pro a Solo rezervovat ve stejný čas.
- Potvrdit ceny, délku vstupu, kapacitu, storno a platby; teprve pak je propsat do SimplyBook, webu a právních dokumentů.

### Zapier a backend

- Ověřit placený Zapier plán s `Webhooks by Zapier` a stav Published všech tří Zapů.
- Po přejmenování služeb vytvořit rezervaci Pro i Solo a v Zap History ověřit `service=2` a `service=3`.
- Projít create → change → cancel nejprve v mock režimu a potom fyzicky na všech třech dveřích.
- Rozhodnout časové okno PINu. Doporučení je rezervace ± bezpečnostní rezerva; současná implementace používá celý kalendářní den.
- Doplnit Nuki token/Smart Lock ID, ostrý Nuki režim, SMTP/SES a nouzové alerty v backendovém repu.

### Povinné vstupy od majitele

- Ceny, délka rezervace, balíčky, kapacita, příplatky a storno/refundace.
- Způsob online platby a údaje slovenského provozovatele.
- Přesná adresa 37 vs. 37C, slovenský telefon a nouzový kontakt.
- Seznam vybavení Pro/Solo, potvrzení sprchy/toalety, hygieny, úklidu, kamer a uchování záznamů.
- MHD, parkování a konkrétní trasa ke každým dveřím.
- Logo, Instagram a fotografie/video skutečných bratislavských prostor.
- VOP, GDPR/cookies a reklamační dokumenty zkontrolované pro slovenské právo.

## Záměrně ponechané placeholdery

- Ceny jsou označené jako „čoskoro / coming soon“.
- Vybavení a zázemí čeká na skutečný seznam.
- Galerie transparentně ukazuje sesterské SoloGym Brno a musí se vyměnit za BA fotografie.
- Logo je textové a Instagram je „čoskoro“.
- Tři právní stránky jsou placeholdery s `noindex`; před spuštěním je nutné dodat finální text.
- Telefon není publikovaný, dokud majitel nepotvrdí správné slovenské číslo.

## Doména a SEO po doplnění obsahu

Webhosting u Českého hostingu je aktivní. GitHub environment `production` je nastavený,
první deploy proběhl úspěšně a `maxgym.sk` i `www.maxgym.sk` fungují přes HTTPS.
Do ostrého spuštění obě adresy zobrazují přes fotografii pouze oznámení
„Už čoskoro nový MAXGYM BRATISLAVA“; celý web je pro kontrolu dostupný na `/test/`.
Podle informace majitele je nejbližší termín úhrady hostingu **18. 9. 2026**; před
tímto datem je potřeba ověřit zaplacení, aby se automatické nasazení ani web nezastavily.
**Neměnit nameservery, `api.maxgym.sk`, MX, DKIM ani DMARC**, jinak může přestat
fungovat backend nebo e-mail.

Po přepnutí domény je nutné:

1. [x] Aktivovat a ověřit Let's Encrypt pro `maxgym.sk` i `www.maxgym.sk`.
2. [x] Změnit URL v `sitemap.xml` a `robots.txt` z GitHub Pages na `https://maxgym.sk`.
3. [ ] Doplnit canonical, SK/EN hreflang a Open Graph metadata už s finální doménou.
4. [ ] Změnit `INFO_URL` backendu na finální informační stránku.

## Kontrola před každým pushem

- `git status` a `git diff --check` jsou čisté bez nechtěných souborů.
- Lokálně projít SK/EN úvod, rezervaci, užitečné info, ceník, vybavení, galerii a právní odkazy.
- Ověřit mobilní menu, iframe SimplyBook, galerii myší i klávesnicí a chybějící obrázky.
- Po pushi zkontrolovat běh workflow `Deploy to Cesky hosting` a živý web.

## Rezervace bez zámků — 24. 10. 2026

Petr požaduje nejprve rezervace bez zámků a potvrdil provoz bez online platby.
V přihlášeném SimplyBook účtu byly skutečně uloženy tyto služby:

| ID služby | Varianta | Délka | Cena | Poskytovatel |
|---|---|---:|---:|---|
| 2 | MaxGym Pro – 75 min | 75 min | 20 € | 2 = MaxGym Pro |
| 4 | MaxGym Pro – 150 min | 150 min | 35 € | 2 = MaxGym Pro |
| 3 | MaxGym Solo – 75 min | 75 min | 10 € | 3 = MaxGym Solo |
| 5 | MaxGym Solo – 150 min | 150 min | 17 € | 3 = MaxGym Solo |

- Původní společný poskytovatel byl rozdělen na Pro a Solo, každý s kapacitou
  jedné rezervace. Obě délky byly přiřazeny výhradně ke správnému prostoru.
- Společnost i oba poskytovatelé mají Po–Ne 00:00–24:00. Uložení otevírací doby
  společnosti ověřeno obnovením stránky. Povoleny návštěvy přes půlnoc.
- Časový krok 15 minut, minimální předstih 30 minut, timezone Europe/Bratislava.
- Aktivována bezplatná funkce Storno podmínky: 1 den, slovenský souhlas a text
  „Rezerváciu je možné zrušiť najneskôr 24 hodín pred začiatkom rezervovaného termínu.“
  Refundace ani vracení vstupů nebyly nově definovány.
- Platební nastavení ukazuje jedinou metodu „Čekající (Zaplatit později)“.
  Nebyla připojena nová brána ani zapnuto opakované účtování.
- Po výslovném schválení Petra uložen a ověřen veřejný kontakt: MaxGym Bratislava,
  +421 948 681 068 a https://maxgym.sk/. Správné údaje potvrzeny i ve veřejném
  formuláři po načtení. Adresa se neměnila.
- Veřejný iframe ukazuje všechny čtyři správné délky a ceny, poskytovatele Pro,
  sobotní a večerní termíny. Veřejný formulář nabízí 150minutový vstup od 23:45.
- Zapier účet MAXGYM SK: všechny tři dveřní Zapy jsou OFF. Ponechány OFF.
- SimplyBook zůstává česky; základní výběr jazyků nenabízí slovenštinu.

SK/EN texty rezervace, úvodu a užitečných informací byly po výslovném schválení
Petra 24. 10. 2026 nahrány z větve `rezervace-bez-zamku` do `main` a nasazeny
na https://maxgym.sk/test/: bez slibu automatického PINu, s pravidly 30 minut /
24 hodin a informací o nepřipojených online platbách a zámcích. Nasazený commit
`4378d2e` zachovává původní vložení a načítání iframe. Workflow Deploy to Cesky
hosting č. 20 skončilo úspěšně:
https://github.com/maxgymbratislava/maxgymbratislava.github.io/actions/runs/40091806623
Všech šest upravených veřejných HTML stránek vrací HTTP 200 a odpovídá lokálním
souborům. Na živé rezervační stránce ověřeno načtení SimplyBook i správný kontakt.
Kořen domény stále zobrazuje oznámení o připravovaném otevření.
Právní dokumenty se neměnily; před ostrým veřejným spuštěním je
nutné sladit jejich požadavek platby a přístupu PINem s dočasným režimem.

Při kontrole notifikací: kredit SMS je 0. Potvrzovací, změnové a storno SMS
jsou vypnuté; připomínka klientovi má zapnutý přepínač 1 hodinu předem, ale bez
kreditu nelze odeslání očekávat. Externí SMS brána není aktivovaná. Nebyl koupen
kredit ani zapnuta placená funkce. Odběr novinek je samostatný marketingový souhlas
a vyplnění telefonu samo o sobě SMS odesílání nezapíná.

Petr výslovně schválil testovací rezervace TEST MaxGym na maxgym@maxgym.sk,
veřejný telefon fitka, přijetí klientských podmínek SimplyBook a storno pravidla.
Úplný průchod veřejným formulářem 24. 10. 2026 prošel:

- Pro 150 minut dne 26. 10. 2026 10:00–12:30 potvrzeno v režimu Zaplatit později,
  bez online platby. Krátké Pro ve stejném prostoru nenabízelo 10:00 ani 11:15;
  další dostupný začátek byl 12:30.
- Solo 75 minut dne 26. 10. 2026 10:00–11:15 potvrzeno současně s Pro.
  Dlouhé Solo ve stejném prostoru nenabízelo překrývající se začátek 10:00.
- Obě rezervace byly klientským stornem zrušeny s důvodem označeným TEST.
  Klientský přehled potvrdil, že nezbývají žádné nadcházející rezervace.
  Čas 10:00 se po obnovení vrátil do nabídky Pro 75 i Solo 150.
- V protokolu e-mailových notifikací SimplyBook jsou potvrzení i storna pro
  oba testy na maxgym@maxgym.sk (klientské i provozovatelské kopie).
  Doručení přímo v cílové schránce nebylo nezávisle ověřeno.
- Testovací objednávky O-00000001 a O-00000002 zůstávají ve stavu čekající
  platby i po stornu rezervace. Nebyly označeny jako zaplacené ani smazány.
  Žádná online platba neproběhla. Jde o účetní záznamy testu, nikoli aktivní
  rezervace nebo blokované termíny.
