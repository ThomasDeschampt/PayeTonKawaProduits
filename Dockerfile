FROM node:20-alpine

WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm install --production=false

# Générer Prisma
RUN npx prisma generate

# Copier le reste des fichiers
COPY . .

# Créer le dossier logs
RUN mkdir -p logs

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"] 