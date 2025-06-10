const amqp = require('amqplib');

class RabbitMQService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.queues = {
            port3002: 'queue_3002',
            port3003: 'queue_3003',
            port3004: 'queue_3004'
        };
    }

    async connect() {
        try {
            this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672');
            this.channel = await this.connection.createChannel();
            console.log('Connexion à RabbitMQ établie');

            await this.createAllQueues();
        } catch (error) {
            console.error('Erreur de connexion à RabbitMQ:', error);
            throw error;
        }
    }

    async createAllQueues() {
        try {
            for (const queueName of Object.values(this.queues)) {
                await this.createQueue(queueName);
            }
        } catch (error) {
            console.error('Erreur lors de la création des files d\'attente:', error);
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

    async sendToPort(port, message) {
        const queueName = this.queues[`port${port}`];
        if (!queueName) {
            throw new Error(`Port ${port} non configuré`);
        }

        try {
            const messageBuffer = Buffer.from(JSON.stringify({
                ...message,
                timestamp: new Date().toISOString(),
                source: 'api-produits',
                destination: `port_${port}`
            }));
            
            await this.channel.sendToQueue(queueName, messageBuffer);
            console.log(`Message envoyé au port ${port}:`, message);
        } catch (error) {
            console.error(`Erreur lors de l'envoi du message au port ${port}:`, error);
            throw error;
        }
    }

    async listenToPort(port, callback) {
        const queueName = this.queues[`port${port}`];
        if (!queueName) {
            throw new Error(`Port ${port} non configuré`);
        }

        try {
            await this.channel.consume(queueName, (msg) => {
                if (msg !== null) {
                    const content = JSON.parse(msg.content.toString());
                    console.log(`Message reçu du port ${port}:`, content);
                    callback(content);
                    this.channel.ack(msg);
                }
            });
            console.log(`Écoute des messages du port ${port} démarrée`);
        } catch (error) {
            console.error(`Erreur lors de l'écoute des messages du port ${port}:`, error);
            throw error;
        }
    }

    async sendToPort3002(message) {
        await this.sendToPort(3002, message);
    }

    async sendToPort3003(message) {
        await this.sendToPort(3003, message);
    }

    async sendToPort3004(message) {
        await this.sendToPort(3004, message);
    }

    async listenToPort3002(callback) {
        await this.listenToPort(3002, callback);
    }

    async listenToPort3003(callback) {
        await this.listenToPort(3003, callback);
    }

    async listenToPort3004(callback) {
        await this.listenToPort(3004, callback);
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