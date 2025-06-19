const { execSync } = require('child_process');
const path = require('path');

// Fonction pour exécuter une commande et afficher sa sortie
function runCommand(command) {
    try {
        console.log(`Exécution de la commande: ${command}`);
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Erreur lors de l'exécution de la commande: ${command}`);
        console.error(error.message);
        process.exit(1);
    }
}

// Fonction pour arrêter les services Docker
function stopDockerServices() {
    console.log('Arrêt des services Docker existants...');
    try {
        runCommand('docker compose down');
        console.log('Services Docker arrêtés avec succès');
    } catch (error) {
        console.log('Aucun service Docker en cours d\'exécution');
    }
}

// Fonction pour démarrer les services Docker
function startDockerServices() {
    console.log('Démarrage des services Docker (sans api-produits)...');
    runCommand('docker compose up -d prometheus grafana');

    console.log('Construction du conteneur api-produits...');
    runCommand('docker compose build api-produits');

    console.log('Services Docker démarrés avec succès, et api-produits est prêt à être lancé en local.');
}


// Fonction principale
async function main() {
    try {
        // Arrêter les services existants
        stopDockerServices();

        // Démarrer les services
        startDockerServices();

        console.log('\nLes services Docker sont prêts !');
        console.log('Vous pouvez maintenant lancer votre application avec: npm start');
    } catch (error) {
        console.error('Erreur lors du démarrage des services:', error);
        process.exit(1);
    }
}

// Exécuter le script
main(); 