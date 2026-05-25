# PostgreSQL 17 with the Open-Capture schema preloaded.
# The SQL files run via /docker-entrypoint-initdb.d/ on the *first*
# container start only (when PGDATA is empty). Subsequent restarts
# reuse the persisted volume.
#
# Build context: the repo root (compose passes context: ..).

FROM postgres:17.6

COPY postgres/sql/structure.sql /docker-entrypoint-initdb.d/01_structure.sql
COPY postgres/sql/data_fr.sql   /docker-entrypoint-initdb.d/02_data_fr.sql
COPY postgres/sql/global.sql    /docker-entrypoint-initdb.d/03_global.sql

EXPOSE 5432
