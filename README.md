# PayeTonKawa - Service Produits Test

Service de gestion des produits pour l'application PayeTonKawa.

## Fonctionnalités

- Gestion complète des produits (CRUD)
- API RESTful documentée avec Swagger
- Monitoring avec Prometheus et Grafana
- Communication asynchrone avec RabbitMQ
- Protection contre les attaques DDoS
- Tests automatisés

## Prérequis

- Node.js (v14 ou supérieur)
- Docker et Docker Compose
- RabbitMQ
- PostgreSQL

## 🔧 Installation

1. Cloner le repository :
```bash
git clone [URL_DU_REPO]
cd PayeTonKawaProduits
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env
# Éditer le fichier .env avec vos configurations
```

4. Démarrer les services avec Docker Compose :
```bash
docker-compose up -d
```

## Démarrage

### Développement
```bash
npm run dev
```

### Production
```bash
npm start
```

## Documentation API

La documentation Swagger est disponible à l'adresse : `http://localhost:3007/api-docs`

## Tests

```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test:coverage
```

## Monitoring

- Métriques Prometheus : `http://localhost:9090`
- Dashboard Grafana : `http://localhost:7070`

## Sécurité

- Rate limiting : 100 requêtes par IP toutes les 15 minutes
- Validation des données
- Protection CORS
- Gestion des erreurs sécurisée
