const rabbitmq = require('../services/rabbitmq');

async function testRabbitMQ() {
    try {
        await rabbitmq.connect();
        console.log('Test de connexion réussi');

        const queueName = 'test_queue';
        await rabbitmq.createQueue(queueName);
        console.log('File d\'attente de test créée');

        const testMessage = {
            type: 'TEST',
            data: {
                message: 'Ceci est un message de test',
                timestamp: new Date().toISOString()
            }
        };
        await rabbitmq.sendMessage(queueName, testMessage);
        console.log('Message de test envoyé');

        await rabbitmq.consumeMessages(queueName, (message) => {
            console.log('Message reçu dans le test:', message);
        });

        console.log('Attente de 5 secondes pour voir les messages...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        await rabbitmq.close();
        console.log('Test terminé avec succès');

    } catch (error) {
        console.error('Erreur pendant le test:', error);
    }
}

testRabbitMQ(); 