# MaxGym Bratislava — web (maxgym.sk)

> **Pokračuješ na novém stroji? Začni souborem [`PROJECT_HANDOFF.md`](PROJECT_HANDOFF.md).** Obsahuje aktuální audit, vazby SimplyBook/Zapier/Nuki, blokery spuštění i bezpečný postup nasazení.

Čistý statický web — **žádný framework, žádný build krok**. HTML + CSS + pár řádků JS.
Vytvořeno 20. 8. 2026 věrnou rekonstrukcí webu www.sologym.pro (Wix) do editovatelného kódu.
Cíl: základ pro web **MaxGym Bratislava** (maxgym.sk), editovatelný majitelem přes GitHub + AI.

## Struktura

```
index.html               úvod (SK)
cennik/                  ceník
rezervacia/              rezervace (SimplyBook iframe)
galerie/                 fotogalerie (lightbox)
vybavenie/               vybavení
uzitocne-info/           instrukce pro návštěvníky
obchodne-podmienky/      právní dokumenty
reklamacny-poriadok/
ochrana-osobnych-udajov/
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

## Deploy (Český hosting)

Produkční web běží na standardním webhostingu Českého hostingu. GitHub zůstává
zdrojem kódu; workflow `.github/workflows/deploy-cesky-hosting.yml` po každém obsahovém
pushi do `main` nahraje web na server přes SSH/rsync. GitHub Pages je pouze dočasný náhled.

Workflow lze zablokovat repozitářovou proměnnou `CH_DEPLOY_ENABLED`. Od 5. 9. 2026 je
nastavena na `true`; GitHub prostředí `production` obsahuje tyto environment secrets:

- `CH_SSH_HOST` — SSH/SFTP server Českého hostingu
- `CH_SSH_PORT` — SSH port
- `CH_SSH_USER` — uživatel s přístupem pouze k webhostingu
- `CH_SSH_PRIVATE_KEY` — privátní část samostatného deploy klíče
- `CH_SSH_KNOWN_HOSTS` — ověřený záznam host key serveru
- `CH_REMOTE_PATH` — přesný existující kořen webu potvrzený Českým hostingem

První nasazení spusť ručně přes Actions → Deploy to Cesky hosting → Run workflow.
Workflow na serveru nic nemaže, aby chybná cílová cesta nemohla odstranit cizí data.
Teprve po kontrole prvního nasazení lze zvážit řízenou synchronizaci odstraněných souborů.

Při přepínání domény **neměnit nameservery ani záznamy `api.maxgym.sk`, MX, DKIM a
DMARC**. Mění se pouze kořen webu a `www` podle pokynů hostingu.

## Vědomé odchylky od Wix originálu

- **Video na úvodce** nahrazeno fotkou (video soubor nebyl z Wixu dostupný — TODO: vyžádat od majitele).
- **Instagram feed** (galerie/úvod) nahrazen statickou fotogalerií + odkazem na profil (živý feed vyžaduje IG API token; lze doplnit).
- **WiFi heslo gymu** z veřejného textu vypuštěno („heslo najdeš v gymu") — nepatří do veřejného repa.
- Opraveny překlepy EN originálu (REZERVATION→RESERVATION, paing→paying, TRANING→TRAINING) a EN navigace přeložena (originál měl v EN verzi české položky menu).
- E-SHOP (odkaz na maxfitnutrition.shop) z menu vypuštěn — rozhodnout, zda patří do MaxGym verze.

## Stav rebrandingu (24. 8. 2026)

HOTOVO: SK primární jazyk (slovenské URL slugy), MaxGym branding (textové logo),
dvě fitka **MaxGym Pro** a **MaxGym Solo** (karty na úvodu, sekce ve vybavení a ceníku),
adresa Klincová 37 / 821 08 Bratislava-Ružinov, kontakt maxgym@maxgym.sk,
SimplyBook iframe na maxgymbratislava.simplybook.it, EN verze zrcadlí SK.
Právní stránky = placeholder (brněnské texty záměrně nepřeneseny — jiná entita/právo).

Audit 24. 8. odstranil nepotvrzená tvrzení o platbách/stornu/PIN okně, opravil rozbitou galerii,
zmenšil používané fotografie a doplnil základní SEO/přístupnost. Podrobnosti viz `PROJECT_HANDOFF.md`.

## TODO — čeká na vstupy majitele

- [x] MAPOVÁNÍ (potvrzeno 20. 8.): **MaxGym Pro = Fitko 1 (event_id 2, vstup z ulice, 1 zámek)**,
      **MaxGym Solo = Fitko 2 (event_id 3, přes chodbu, 2 zámky/2 klávesnice)** — web doplněn
- [ ] Přejmenovat služby v SimplyBook adminu: Fitko 1 → "MaxGym Pro", Fitko 2 → "MaxGym Solo"
      (bezpečné — routing jde přes numerické ID, ne jméno)
- [ ] Ceník v EUR (zatím „čoskoro“ v `cennik/`)
- [ ] Seznamy vybavení obou fitek (po instalaci strojů)
- [ ] Telefon (zatím vynechán), Instagram (zatím "čoskoro"), logo (zatím textové)
- [ ] Fotky BA prostor (galerie zatím ukazuje brněnskou pobočku, s poznámkou)
- [ ] MHD/parkování/navigace v uzitocne-info
- [ ] Právní dokumenty od právníka (SK entita)
- [x] Aktivovat webhosting, doplnit GitHub environment secrets a otestovat deploy (5. 9. 2026)
- [ ] Připojit `maxgym.sk` a `www` k webhostingu; `api`, MX, DKIM a DMARC ponechat beze změny
- [x] Zmenšit používané fotky galerie a úvodních kroků na webové rozlišení
