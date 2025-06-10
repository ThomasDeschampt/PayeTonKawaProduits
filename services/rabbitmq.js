const amqp = require('amqplib');

class RabbitMQService {
    constructor() {
        this.connection = null;
        this.channel = null;
    }

    async connect() {
        try {
            this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672');
            this.channel = await this.connection.createChannel();
            console.log('Connexion à RabbitMQ établie');
        } catch (error) {
            console.error('Erreur de connexion à RabbitMQ:', error);
            throw error;
        }
    }

    async createQueue(queueName) {
        try {
            await this.channel.assertQueue(queueName, {
                durable: true
            });
            console.log(`File d'attente ${queueName} créée ou déjà existante`);
        } catch (error) {
            console.error(`Erreur lors de la création de la file d'attente ${queueName}:`, error);
            throw error;
        }
    }

    async sendMessage(queueName, message) {
        try {
            await this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
            console.log(`Message envoyé à la file d'attente ${queueName}`);
        } catch (error) {
            console.error(`Erreur lors de l'envoi du message à la file d'attente ${queueName}:`, error);
            throw error;
        }
    }

    async consumeMessages(queueName, callback) {
        try {
            await this.channel.consume(queueName, (msg) => {
                if (msg !== null) {
                    const content = JSON.parse(msg.content.toString());
                    callback(content);
                    this.channel.ack(msg);
                }
            });
            console.log(`Début de la consommation des messages de la file d'attente ${queueName}`);
        } catch (error) {
            console.error(`Erreur lors de la consommation des messages de la file d'attente ${queueName}:`, error);
            throw error;
        }
    }

    async close() {
        try {
            await this.channel.close();
            await this.connection.close();
            console.log('Connexion RabbitMQ fermée');
        } catch (error) {
            console.error('Erreur lors de la fermeture de la connexion RabbitMQ:', error);
            throw error;
        }
    }
}

module.exports = new RabbitMQService(); 