# MaxGym Bratislava — web (maxgym.sk)

Čistý statický web — **žádný framework, žádný build krok**. HTML + CSS + pár řádků JS.
Vytvořeno 20. 8. 2026 věrnou rekonstrukcí webu www.sologym.pro (Wix) do editovatelného kódu.
Cíl: základ pro web **MaxGym Bratislava** (maxgym.sk), editovatelný majitelem přes GitHub + AI.

## Struktura

```
index.html               úvod (CZ)
cenik/                   ceník
rezervace/               rezervace (SimplyBook iframe)
galerie/                 fotogalerie (lightbox)
vybaveni/                vybavení — 16 karet
uzitecne-info/           instrukce pro návštěvníky
obchodni-podminky/       právní dokumenty
reklamacni-rad-a-podminky/
ochrana-osobnich-udaju/
en/                      anglická verze (stejná struktura, bez právních stránek)
assets/css/style.css     veškeré styly (barvy = CSS proměnné v :root)
assets/js/main.js        mobilní menu + lightbox
assets/img/              všechny obrázky (staženy z Wix CDN v plném rozlišení)
```

## Jak upravovat

- **Texty:** přímo v HTML souborech. Každá stránka je samostatná (hlavička/patička jsou zkopírované v každém souboru — při změně menu je nutné upravit všechny soubory, s AI to je jeden prompt).
- **Barvy/fonty:** `assets/css/style.css`, blok `:root` nahoře (`--bg`, `--text`, `--red`, `--red-dark`).
- **Rezervační systém:** iframe v `rezervace/index.html` a `en/rezervace/index.html`.

## Lokální náhled

Otevři `index.html` v prohlížeči, nebo:
```
python3 -m http.server 8000
```
(absolutní cesty `/assets/...` vyžadují server, ne file://)

## Deploy (GitHub Pages)

1. Repo na GitHubu → Settings → Pages → Source: `main` branch, `/ (root)`
2. Web běží na `https://<user>.github.io/<repo>/`
3. Vlastní doména: Settings → Pages → Custom domain (vytvoří soubor `CNAME`),
   u registrátora nastavit A záznamy `@` na GitHub Pages IP + CNAME `www`.
   ⚠️ Pro maxgym.sk: NIKDY neměnit nameservery — jen A/CNAME záznamy (kvůli api.maxgym.sk a mailu).

## Vědomé odchylky od Wix originálu

- **Video na úvodce** nahrazeno fotkou (video soubor nebyl z Wixu dostupný — TODO: vyžádat od majitele).
- **Instagram feed** (galerie/úvod) nahrazen statickou fotogalerií + odkazem na profil (živý feed vyžaduje IG API token; lze doplnit).
- **WiFi heslo gymu** z veřejného textu vypuštěno („heslo najdeš v gymu") — nepatří do veřejného repa.
- Opraveny překlepy EN originálu (REZERVATION→RESERVATION, paing→paying, TRANING→TRAINING) a EN navigace přeložena (originál měl v EN verzi české položky menu).
- E-SHOP (odkaz na maxfitnutrition.shop) z menu vypuštěn — rozhodnout, zda patří do MaxGym verze.

## Stav rebrandingu (20. 8. 2026)

HOTOVO: SK primární jazyk (slovenské URL slugy), MaxGym branding (textové logo),
dvě fitka **MaxGym Pro** a **MaxGym Solo** (karty na úvodu, sekce ve vybavení a ceníku),
adresa Klincová 37 / 821 08 Bratislava-Ružinov, kontakt maxgymbratislava@gmail.com,
SimplyBook iframe na maxgymbratislava.simplybook.it, EN verze zrcadlí SK.
Právní stránky = placeholder (brněnské texty záměrně nepřeneseny — jiná entita/právo).

## TODO — čeká na vstupy majitele

- [x] MAPOVÁNÍ (potvrzeno 20. 8.): **MaxGym Pro = Fitko 1 (event_id 2, vstup z ulice, 1 zámek)**,
      **MaxGym Solo = Fitko 2 (event_id 3, přes chodbu, 2 zámky/2 klávesnice)** — web doplněn
- [ ] Přejmenovat služby v SimplyBook adminu: Fitko 1 → "MaxGym Pro", Fitko 2 → "MaxGym Solo"
      (bezpečné — routing jde přes numerické ID, ne jméno)
- [ ] Ceník v EUR (placeholdery __ € v cennik/)
- [ ] Seznamy vybavení obou fitek (po instalaci strojů)
- [ ] Telefon (zatím vynechán), Instagram (zatím "čoskoro"), logo (zatím textové)
- [ ] Fotky BA prostor (galerie zatím ukazuje brněnskou pobočku, s poznámkou)
- [ ] MHD/parkování/navigace v uzitocne-info
- [ ] Právní dokumenty od právníka (SK entita)
- [ ] Doména maxgym.sk (Pointing: A @ -> GitHub Pages IP, CNAME www; api + MX NESAHAT)
- [ ] Zmenšit fotky galerie na webové rozlišení (rychlost na mobilu)
