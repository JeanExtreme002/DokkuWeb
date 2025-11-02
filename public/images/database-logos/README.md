# Database Logos

Este diretório contém os logotipos dos diferentes sistemas de gerenciamento de banco de dados suportados pelo Dokku Dashboard.

## Estrutura dos Arquivos

- `postgresql.svg` - Logo do PostgreSQL
- `mysql.svg` - Logo do MySQL
- `mongodb.svg` - Logo do MongoDB
- `redis.svg` - Logo do Redis
- `mariadb.svg` - Logo do MariaDB
- `couchdb.svg` - Logo do CouchDB
- `cassandra.svg` - Logo do Apache Cassandra
- `elasticsearch.svg` - Logo do Elasticsearch
- `influxdb.svg` - Logo do InfluxDB
- `generic.svg` - Ícone genérico para bancos de dados desconhecidos

## Origem das Imagens

Todas as imagens (exceto o `generic.svg`) foram baixadas do repositório oficial do Devicon:
- Repositório: https://github.com/devicons/devicon
- CDN: https://cdn.jsdelivr.net/gh/devicons/devicon/

O ícone genérico (`generic.svg`) foi criado especificamente para este projeto usando uma representação visual de banco de dados com cilindros empilhados.

## Uso

As imagens são utilizadas no componente `ServicesPage` através do mapeamento definido em `DATABASE_IMAGES`, permitindo que os serviços sejam exibidos com seus respectivos logotipos de forma offline, sem depender de recursos externos.

## Formato

Todos os arquivos estão no formato SVG para garantir:
- Qualidade em qualquer resolução
- Tamanho de arquivo otimizado
- Compatibilidade com temas claro/escuro
- Carregamento rápido
