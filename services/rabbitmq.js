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
        this.maxRetries = 5;
        this.retryDelay = 5000;
    }

    async connect() {
        let retries = 0;
        while (retries < this.maxRetries) {
            try {
                console.log(`Tentative de connexion à RabbitMQ (${retries + 1}/${this.maxRetries})...`);
                this.connection = await amqp.connect(process.env.RABBITMQ_URL);
                console.log('Connexion à RabbitMQ établie avec succès');
                
                this.channel = await this.connection.createChannel();
                console.log('Canal RabbitMQ créé avec succès');

                for (const queue of Object.values(this.queues)) {
                    await this.channel.assertQueue(queue, {
                        durable: true
                    });
                    console.log(`File d'attente ${queue} déclarée`);
                }

                this.connection.on('error', (err) => {
                    console.error('Erreur de connexion RabbitMQ:', err);
                    this.reconnect();
                });

                this.connection.on('close', () => {
                    console.log('Connexion RabbitMQ fermée');
                    this.reconnect();
                });

                return true;
            } catch (error) {
                retries++;
                console.error(`Erreur de connexion à RabbitMQ (tentative ${retries}/${this.maxRetries}):`, error.message);
                
                if (retries === this.maxRetries) {
                    console.error('Nombre maximum de tentatives atteint. Impossible de se connecter à RabbitMQ.');
                    throw error;
                }
                
                console.log(`Nouvelle tentative dans ${this.retryDelay/1000} secondes...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
            }
        }
    }

    async reconnect() {
        if (this.connection) {
            try {
                await this.connection.close();
            } catch (error) {
                console.error('Erreur lors de la fermeture de la connexion:', error);
            }
        }
        
        this.connection = null;
        this.channel = null;
        
        try {
            await this.connect();
        } catch (error) {
            console.error('Échec de la reconnexion:', error);
        }
    }

    async sendMessage(queue, message) {
        if (!this.channel) {
            throw new Error('Canal RabbitMQ non initialisé');
        }

        try {
            const queueName = this.queues[queue];
            if (!queueName) {
                throw new Error(`File d'attente ${queue} non trouvée`);
            }

            await this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
                persistent: true
            });
            console.log(`Message envoyé à la file d'attente ${queueName}`);
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            throw error;
        }
    }

    async listenToPort(port, callback) {
        if (!this.channel) {
            throw new Error('Canal RabbitMQ non initialisé');
        }

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
        if (this.channel) {
            await this.channel.close();
        }
        if (this.connection) {
            await this.connection.close();
        }
    }
}

module.exports = new RabbitMQService(); 