# MaxGym Bratislava web — stav a předání

**Aktualizováno:** 5. 9. 2026
**Produkce:** https://maxgym.sk/
**Dočasný náhled:** https://maxgymbratislava.github.io/
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
- Slovenština je primární (`/`), angličtina je pod `/en/`.
- Rezervace je vložený SimplyBook iframe z `maxgymbratislava.simplybook.it`.
- Produkční nasazení běží přes GitHub Actions a SSH/rsync na Český hosting.
- Workflow je aktivní (`CH_DEPLOY_ENABLED=true`); první ruční deploy uspěl 5. 9. 2026.
- Absolutní cesty `/assets/...` předpokládají nasazení v kořeni domény.
- Web neobsahuje žádná tajemství. Přístupové údaje patří do password manageru, nikdy do tohoto veřejného repa.

Lokální spuštění:

```bash
cd maxgym_web
python3 -m http.server 8000
```

Na novém stroji je nutné znovu provést `gh auth login` pro účet `maxgymbratislava`; přihlášení uložené v macOS klíčence se kopírováním složky nepřenese.

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
první deploy proběhl úspěšně a `maxgym.sk` i `www.maxgym.sk` vracejí web přes HTTPS.
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
