# MySQL + Admin Panel (Docker)

This project gives you:
- A MySQL database container
- An Admin Panel (Adminer) container
- Persistent data storage using Docker volumes

## 1) Start the project

```bash
docker compose up -d
```

## 2) Open the admin panel

- URL: `http://localhost:8081`
- System: `MySQL`
- Server: `mysql` (or `db`)
- Username: value from `.env` (`MYSQL_USER`)
- Password: value from `.env` (`MYSQL_PASSWORD`)
- Database: value from `.env` (`MYSQL_DATABASE`)

## Architecture (Simple Diagram)

```text
Browser
  |
  | http://localhost:8081
  v
Adminer Container
  |
  | MySQL protocol over Docker network
  | Server: mysql (alias: db)
  v
MySQL Container (port 3306)
  |
  | writes DB files
  v
Host Folder: ./mysql-data
```

## 3) Check MySQL from terminal

```bash
docker compose exec mysql mysql -uappuser -papppass123 appdb -e "SELECT * FROM users;"
```

## Volumes and Data Persistence
used store our data in volume , if the container is removed/recreated
In `docker-compose.yml`:

```yaml
volumes:
  - ./mysql-data:/var/lib/mysql
```

Why this matters:
- MySQL stores all DB files in `/var/lib/mysql` inside the container.
- `./mysql-data` is a folder in your project mapped to that path.
- If the container is removed/recreated, data remains in `./mysql-data`.

Try it:
1. Start: `docker compose up -d`
2. Insert some data
3. Stop/remove containers: `docker compose down`
4. Start again: `docker compose up -d`
5. Data is still there (because `./mysql-data` still exists)

If you want to delete containers:

```bash
docker compose down
```

If you also want to delete DB data, remove the mapped folder:

```bash
rm -rf ./mysql-data
```

## Important note about `initdb/01-init.sql`

Files in `./initdb` run only on first initialization (when `./mysql-data` is empty).
If you already have data in `./mysql-data`, this script will not run again unless you clear that folder.
