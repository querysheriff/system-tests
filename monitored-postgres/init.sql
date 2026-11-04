CREATE EXTENSION pg_stat_statements;

CREATE USER querysheriff_collector WITH PASSWORD 'querysheriff_collector' CONNECTION LIMIT 5;
GRANT pg_monitor TO querysheriff_collector;

CREATE DATABASE shop;
\connect shop
CREATE TABLE orders (id int PRIMARY KEY, total numeric NOT NULL);
INSERT INTO orders SELECT g, g * 10 FROM generate_series(1, 1000) g;
