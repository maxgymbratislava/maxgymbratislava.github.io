# MaxGym Bratislava — web (maxgym.sk)

> **Pokračuješ na novém stroji? Začni souborem [`PROJECT_HANDOFF.md`](PROJECT_HANDOFF.md).** Obsahuje aktuální audit, vazby SimplyBook/Zapier/Nuki, blokery spuštění i bezpečný postup nasazení.
>
> **Předáváš projekt majiteli a jeho AI agentovi?** Použij hotový návod a prompt v
> [`PREDANI_MAJITELI_AGENT.md`](PREDANI_MAJITELI_AGENT.md).

Čistý statický web — **žádný framework, žádný build krok**. HTML + CSS + pár řádků JS.
Vytvořeno 20. 8. 2026 věrnou rekonstrukcí webu www.sologym.pro (Wix) do editovatelného kódu.
Cíl: základ pro web **MaxGym Bratislava** (maxgym.sk), editovatelný majitelem přes GitHub + AI.

## Aktuální režim ostrého provozu

- Kompletní web je od 3. 11. 2026 veřejně dostupný na `https://maxgym.sk/`.
- Slovenština je v kořeni, anglická verze pod `https://maxgym.sk/en/`.
- Staré adresy pod `/test/` se trvale přesměrovávají na odpovídající ostré adresy.
- Veřejné stránky jsou indexovatelné a uvedené v `sitemap.xml`.

## Struktura

```
index.html                    veřejný úvod (SK)
robots.txt, sitemap.xml       indexování veřejných SK/EN stránek
cennik/                       ceník
rezervacia/                   rezervace (SimplyBook widget)
galeria/                      fotogalerie (lightbox)
vybavenie/                    vybavení
uzitocne-info/                instrukce pro návštěvníky
obchodne-podmienky/           právní dokumenty
reklamacny-poriadok/
ochrana-osobnych-udajov/
en/                           anglická verze (stejná struktura, bez právních stránek)
assets/css/style.css          veškeré styly (barvy = CSS proměnné v :root)
assets/js/main.js             mobilní menu + lightbox
assets/img/                   optimalizované obrázky používané webem
source-images/                lokální nepoškozené originály (ignorované Gitem)
scripts/optimize-images.ps1   opakovatelná tvorba webových kopií z originálů
```

## Jak upravovat

- **Texty:** přímo v HTML souborech v kořeni a jeho podadresářích. Každá stránka je samostatná
  (hlavička/patička jsou zkopírované v každém souboru — při změně menu je nutné
  upravit všechny soubory, s AI to je jeden prompt).
- **Barvy/fonty:** `assets/css/style.css`, blok `:root` nahoře
  (`--bg`, `--text`, `--red`, `--red-dark`).
- **Rezervační systém:** oficiální SimplyBook widget v `rezervacia/index.html`
  a `en/rezervacia/index.html`, inicializace v `assets/js/booking.js`.
  Prosté vložení veřejné `/v2/` stránky nezapíná iframe správu relace SimplyBooku.

## Lokální náhled

Spusť server v kořeni repozitáře:
```
python3 -m http.server 8000
```

Celý web bude na `http://localhost:8000/`. Absolutní cesty `/assets/...` vyžadují
server, ne otevření přes `file://`.

## Obrázky

Originální JPEGy jsou uložené lokálně v `source-images/`. Složka je v `.gitignore`,
protože veřejný GitHub repozitář ani webhosting nejsou vhodné místo pro plné zdrojové
fotografie. **Originály je nutné samostatně zálohovat do soukromého úložiště.** Web
používá pouze nově vygenerované soubory v `assets/img/`. Jejich vytvoření na
Windows bez instalace dalšího programu:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/optimize-images.ps1
```

Skript koriguje EXIF orientaci, zmenší delší stranu nejvýše na 1920 px, uloží JPEG
v kvalitě 85 a každý výstup znovu načte. Zdrojové originály nepřepisuje.

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

Nasazení lze spustit ručně přes Actions → Deploy to Cesky hosting → Run workflow.
Po ověření přesné cílové složky používá workflow řízenou synchronizaci: odstraní ze
serveru soubory, které už nejsou v repozitáři. Systémovou složku `.well-known/`
výslovně zachovává kvůli HTTPS certifikátu; `source-images/` a `scripts/` se na
veřejný server nenahrávají.

### Zpřístupnění hotového webu v kořeni — provedeno 3. 11. 2026

Ostré spuštění bylo provedeno v jednom commitu:

1. obsah `test/` byl přesunut do kořene repozitáře;
2. cesty `/test/...` byly změněny na `/...`;
3. z veřejných stránek bylo odstraněno `noindex, nofollow`;
4. `robots.txt` a `sitemap.xml` byly upraveny pro ostré SK/EN stránky;
5. staré adresy `/test/` byly přesměrovány na odpovídající ostré adresy.

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
adresa Klincová 16637/37C / 821 08 Bratislava-Ružinov, kontakt maxgym@maxgym.sk,
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
- [x] Připojit `maxgym.sk` a `www` k webhostingu; `api`, MX, DKIM a DMARC ponechat beze změny
- [x] Zmenšit používané fotky galerie a úvodních kroků na webové rozlišení
