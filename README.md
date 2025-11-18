# SutarciuKontroleSistema
#  
Sistemos paskirtis

Projekto tikslas – sukurti sistemą, kuri leistų lengvai sekti, registruoti, saugoti savo sukurtas sutartis ir jų galiojimą.

Veikimo principas – aplikacija yra sudaryta iš dviejų dalių, pati internetinė aplikacija, kuria naudoja svečias, naudotojas, administratorius ir pati aplikacijos programavimo sąsaja.

Naudotojas, norintis naudotis šia sistemą turi prisiregistruoti prie internetinės aplikacijos ir tada galės jisai sukurti sutarčių įrašus prie kurių galės priskirti kitus sutarties vykdytojus, pradžios ir galiojimo pabaigos datą, kas kiek dienų ar prieš kiek dienų nuo galiojimo pabaigos priminti vartotoją. Sudaręs naują sutartį vartotojas gali ją redaguoti ir archyvuoti (archyvai yra savo skiltyje ir yra ištrinami tik administratorių) ir dalintis jos nuoroda su visais. Prie sutarties pridėti asmenys gali tiktai tą sutartį matyti, o redaguoti ar archyvuoti jos negali. Administratorius mato visas sutartis ir jas gali redaguoti arba archyvuoti. Svečias gali tiktai atidaryti nuorodas į sutartį ir jas peržiūrėti.

## Paleidimas su Docker

Žemiau aprašyti žingsniai leidžia greitai paleisti API ir duomenų bazę naudojant Docker.

### Reikalavimai

- Įdiegtas Docker ir Docker Compose

### Greitas startas

Projektas turi `docker-compose.yml`, kuris pakelia:

- MariaDB duomenų bazę su pradiniu duomenų užpildymu iš `Backend/sql/SutarciuKontrole.sql`
- .NET 9 API (klausosi 8080 prievade)

Paleidimas (fish shell):

```fish
# Iš projekto šaknies
docker compose up -d --build

# Patikrinti konteinerių būseną
docker compose ps

# Žiūrėti backend žurnalus
docker compose logs -f backend
```

Kai paslauga paleista, Swagger bus pasiekiamas adresu:

- http://localhost:8080/swagger

### Duomenų bazės peržiūra (UI)

Į `docker-compose.yml` pridėtas phpMyAdmin. Atidarykite:

- http://localhost:8081

Prisijungimas:

- Server: `db`
- Vartotojas: `root`
- Slaptažodis: reikšmė iš `.env` `MYSQL_ROOT_PASSWORD` (jei palikta tuščia, naudojama numatytoji `changeme`)

Matysite `SutarciuKontrole` bazę ir lenteles. Galite vykdyti SQL užklausas, eksportuoti/importuoti duomenis.

API naudoja tokią jungties eilutę (compose perrašo per env):

```
server=db;port=3306;user=root;password=changeme;database=SutarciuKontrole;TreatTinyAsBoolean=true;AllowUserVariables=true;
```

### Aplinkos kintamieji

`docker-compose.yml` numatytieji (galite keisti prieš paleidimą):

- DB slaptažodis: `MYSQL_ROOT_PASSWORD=changeme`
- DB pavadinimas: `MYSQL_DATABASE=SutarciuKontrole`
- API aplinka: `ASPNETCORE_ENVIRONMENT=Development`

Papildomai galite perrašyti JWT nustatymus (užkomentuota compose faile):

- `Jwt__Issuer`, `Jwt__Audience`, `Jwt__Key`

Rekomenduojama saugiems paleidimams pasikeisti `changeme` ir JWT `Key`.

### Duomenų bazės inicializavimas

Pirmo paleidimo metu MariaDB konteineris automatiškai sukuria DB ir įvykdo `Backend/sql/SutarciuKontrole.sql` skriptą. Jei norite pradėti „švariai“, ištrinkite `db_data` tūrį:

```fish
docker compose down -v
docker compose up -d --build
```

### Naudingi veiksmai

```fish
# Sustabdyti paslaugas
docker compose down

# Perstatyti tik backend vaizdą
docker compose build backend

# Atidaryti DB prievadą host'e (jau atidaromas 3306)
docker compose ps
```

### Pastabos

- Backend konteineris klausosi 8080 prievade konteineryje ir publikuojamas į host'ą `8080:8080`.
- Jei norite naudoti MySQL vietoje MariaDB, atnaujinkite `docker-compose.yml` `image: mysql:8.4` ir prireikus suderinkite SQL skriptą.