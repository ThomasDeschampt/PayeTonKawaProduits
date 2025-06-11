const { execSync } = require('child_process');

function stopDockerServices() {
    console.log("Arrêt des services Docker existants...");
    try {
        execSync("docker-compose down", { stdio: "inherit" });
        console.log("Services Docker arrêtés avec succès");
    } catch (error) {
        console.error("Erreur lors de l'arrêt des services Docker:", error.message);
    }
}

function startDockerServices() {
    console.log("Démarrage des services Docker...");
    try {
        execSync("docker-compose up -d", { stdio: "inherit" });
        console.log("Services Docker démarrés avec succès");
    } catch (error) {
        console.error("Erreur lors du démarrage des services Docker:", error.message);
        process.exit(1);
    }
}

async function main() {
    stopDockerServices();
    startDockerServices();

    console.log("Attente du démarrage des services...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log("Démarrage de l'application...");
    execSync("nodemon server.js", { stdio: "inherit" });
}

main().catch(error => {
    console.error("Erreur:", error);
    process.exit(1);
}); 