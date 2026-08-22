# MaxGym web (základ: 1:1 klon sologym.pro)

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

## TODO — rebrand na MaxGym Bratislava

- [ ] Texty CZ → SK, SoloGym → MaxGym, Brno → Bratislava
- [ ] Ceník → EUR (ceny dodá majitel)
- [ ] Adresa, telefon, e-mail, mapa BA (dodá majitel)
- [ ] Dvě fitka: karty na úvodu, rozdělené vybavení, 2 rezervační tlačítka
  (SimplyBook: https://maxgymbratislava.simplybook.it — Fitko 1 = event_id 2, Fitko 2 = event_id 3)
- [ ] Logo MaxGym + fotky BA prostor (po instalaci strojů)
- [ ] Právní dokumenty → SK entita (právník)
- [ ] Úvodní instrukce: Fitko 2 = jeden kód, dvě klávesnice
