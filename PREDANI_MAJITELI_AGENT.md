# MaxGym Bratislava — napojení majitele a jeho AI agenta

Tento soubor lze celý předat majiteli. Obsahuje bezpečný postup přístupu k projektu,
aktuální stav webu a hotový prompt pro jeho AI agenta. Neobsahuje žádná hesla,
API tokeny, SSH klíče ani jiné tajné údaje.

## 1. Kde je projekt

- GitHub repozitář: <https://github.com/maxgymbratislava/maxgymbratislava.github.io>
- hlavní větev: `main`
- veřejná stránka: <https://maxgym.sk/>
- pracovní verze celého webu: <https://maxgym.sk/test/>
- automatické nasazení: GitHub Actions → `Deploy to Cesky hosting`

Web je čisté HTML, CSS a JavaScript bez frameworku a bez build kroku. Podrobnosti jsou
v souborech `README.md` a `PROJECT_HANDOFF.md`, které musí agent před každou větší
změnou nejprve přečíst.

## 2. Bezpečné zpřístupnění GitHubu majiteli

Majitel by měl používat vlastní GitHub účet. Není vhodné předávat heslo ke stávajícímu
účtu ani přeposílat přístupový token.

1. Majitel si vytvoří nebo použije svůj vlastní GitHub účet.
2. Správce repozitáře jej přidá v GitHubu přes
   `Settings → Collaborators → Add people` s oprávněním `Write`.
3. Majitel ve svém AI agentovi připojí GitHub a povolí přístup pouze k repozitáři
   `maxgymbratislava/maxgymbratislava.github.io`, pokud jeho nástroj omezení na jeden
   repozitář podporuje.
4. Pokud agent pracuje lokálně, majitel se přihlásí příkazem `gh auth login` a projekt
   získá příkazem:

   ```bash
   git clone https://github.com/maxgymbratislava/maxgymbratislava.github.io.git
   cd maxgymbratislava.github.io
   ```

5. Na Windows bez administrátorských práv lze místo instalace použít PortableGit.
   Po rozbalení se spustí `git-bash.exe` nebo `cmd/git.exe`; další příkazy jsou stejné.

Pokud nástroj žádá široký přístup ke všem repozitářům, e-mailu nebo správě účtu,
nepovolovat jej bez kontroly. Pro práci na webu stačí čtení a zápis tohoto repozitáře.

## 3. Jak pracovat bez nechtěného nasazení

Každý obsahový push do `main` automaticky mění živý web na Českém hostingu. Bezpečný
postup je proto:

```bash
git switch main
git pull --ff-only
git switch -c uprava/kratky-popis
```

Agent provede změny v nové větvi, lokálně je zkontroluje a ukáže majiteli souhrn nebo
pull request. Do `main` se změna sloučí až po schválení majitelem. Samotná změna pouze
Markdown dokumentace automatický deploy nespouští.

Po schváleném nasazení je nutné zkontrolovat GitHub Actions a potom živé adresy.
Český hosting může HTML držet v cache až dvě hodiny; aktuální verzi lze při kontrole
vynutit tvrdým obnovením `Ctrl+F5` nebo dočasným query parametrem, například `?v=2`.

## 4. Aktuální uspořádání a důležitá pravidla

- Kořen `index.html` je dočasná stránka s fotografií a textem
  „Už čoskoro nový MAXGYM BRATISLAVA“.
- Kompletní slovenský web je v adresáři `test/`, anglická verze v `test/en/`.
- Všechny pracovní HTML stránky mají `noindex, nofollow`; `robots.txt` blokuje `/test/`.
- Pracovní web není chráněný heslem. Kdo zná adresu `/test/`, může jej otevřít.
- Cesty pracovního webu začínají `/test/`, včetně obrázků, CSS a JavaScriptu.
- Optimalizované obrázky používané webem jsou v `test/assets/img/`.
- Plné originální fotografie nejsou ve veřejném GitHubu. Lokální složka
  `source-images/` je ignorovaná Gitem a musí se předat nebo zálohovat soukromě.
- Nové webové kopie lze vytvořit skriptem `scripts/optimize-images.ps1`.
- Nikdy neukládat do repozitáře hesla, tokeny, soukromé klíče, zákaznická data ani PINy.
- Neměnit nameservery, `api.maxgym.sk`, MX, DKIM ani DMARC. Mohlo by přestat fungovat
  otevírání dveří nebo e-mail.
- SimplyBook služby mohou změnit veřejný název, ale jejich stabilní `event_id` musí
  zůstat: MaxGym Pro = `2`, MaxGym Solo = `3`.
- Ceny, storno, platby, vybavení a právní texty se nesmějí domýšlet. Pokud nejsou
  potvrzené majitelem, agent si musí vyžádat podklady.
- Podle předané informace má být úhrada hostingu ověřena nejpozději 18. 9. 2026.

## 5. Hotový prompt pro AI agenta

Následující blok zkopírujte jako první zprávu agentovi. Poslední řádek vždy doplňte
konkrétním požadavkem.

```text
Jsi vývojový agent webu MaxGym Bratislava. Pracuj s repozitářem:
https://github.com/maxgymbratislava/maxgymbratislava.github.io

Nejprve se k repozitáři připoj nebo jej naklonuj, ověř větev a spusť `git status`.
Potom si celý přečti soubory README.md, PROJECT_HANDOFF.md a
PREDANI_MAJITELI_AGENT.md. Než začneš měnit soubory, stručně mi potvrď aktuální stav,
co je veřejně na maxgym.sk a co je pod /test/. Pokud k repozitáři nemáš zápis, nic
neobcházej a přesně mi napiš, jaké oprávnění chybí.

Pravidla práce:
- Komunikuj se mnou srozumitelně česky nebo slovensky.
- Pracuj v nové větvi `uprava/kratky-popis`; do `main` nic neposílej bez mého
  výslovného pokynu „nasadit“.
- Zachovej dočasnou veřejnou stránku v kořeni a celý web pod /test/, dokud výslovně
  neřeknu, že se web spouští veřejně.
- Slovenština je hlavní jazyk, angličtina je v /test/en/. Při obsahové změně zvaž
  obě jazykové verze a zachovej funkční interní odkazy.
- Nevymýšlej ceny, storno, platební pravidla, vybavení, kontaktní údaje ani právní
  formulace. Chybějící rozhodnutí mi polož jako konkrétní otázku.
- Neměň DNS, nameservery, api.maxgym.sk, MX, DKIM, DMARC, GitHub secrets ani hostingové
  přístupy, pokud to není můj samostatný výslovný požadavek.
- Nikdy nevkládej do Gitu hesla, tokeny, SSH klíče, PINy ani osobní údaje zákazníků.
- Zachovej SimplyBook event_id: MaxGym Pro = 2, MaxGym Solo = 3.
- Plné originální fotografie nejsou v repozitáři. Nezaměňuj je za webové kopie a
  nepublikuj je bez souhlasu.
- Před předáním spusť kontroly odkazů a chybějících souborů, `git diff --check` a
  projdi relevantní stránky lokálně. Změny v dokumentaci udržuj v souladu s kódem.
- Před commitem mi ukaž stručný seznam změn a upozorni, zda jejich sloučení do `main`
  spustí produkční deploy.
- Po mém pokynu „nasadit“ změny commitni, odešli schváleným způsobem, zkontroluj
  GitHub Actions `Deploy to Cesky hosting` a ověř živý web. Při chybě nasazení se
  zastav, nic nemaž na serveru ručně a popiš příčinu.

Můj aktuální požadavek:
[SEM MAJITEL NAPÍŠE KONKRÉTNÍ ZMĚNU]
```

## 6. Co majitel musí před první větší úpravou dodat

Aktuální úplný seznam je v `PROJECT_HANDOFF.md`. Nejdůležitější jsou ceny a délky
rezervací, storno a platby, slovenský provozovatel, finální adresa a telefon, skutečné
vybavení obou fitek, fotografie Bratislavy a právně ověřené VOP/GDPR/reklamace.

Bez těchto podkladů má agent ponechat existující placeholdery a nesmí prezentovat
odhady jako hotová fakta.
