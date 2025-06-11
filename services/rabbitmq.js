const amqp = require('amqplib');
require('dotenv').config();
const config = require('../config');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:4001';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Configuration des queues et échanges
const EXCHANGES = {
    COMMAND: 'command.exchange',
    PRODUCT: 'product.exchange',
    CLIENT: 'client.exchange'
};

const QUEUES = {
    // Queues pour les produits
    PRODUCT_CREATED: 'product.created',
    PRODUCT_UPDATED: 'product.updated',
    PRODUCT_DELETED: 'product.deleted',
    
    // Queues pour les commandes
    ORDER_CREATED: 'order.created',
    ORDER_UPDATED: 'order.updated',
    ORDER_DELETED: 'order.deleted',
    
    // Queues pour les clients
    CLIENT_CREATED: 'client.created',
    CLIENT_UPDATED: 'client.updated',
    CLIENT_DELETED: 'client.deleted'
};

class RabbitMQService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.queues = {
            port3002: 'queue_port_3002',
            port3003: 'queue_port_3003',
            port3004: 'queue_port_3004'
        };
        this.isConnecting = false;
        console.log('Service RabbitMQ initialisé avec URL:', RABBITMQ_URL);
    }

    async connect() {
        if (this.isConnecting) {
            console.log('Une tentative de connexion est déjà en cours...');
            return;
        }

        this.isConnecting = true;
        let retries = 0;
        
        while (retries < MAX_RETRIES) {
            try {
                console.log(`Tentative de connexion à RabbitMQ (${retries + 1}/${MAX_RETRIES})...`);
                console.log('URL de connexion:', RABBITMQ_URL);
                
                this.connection = await amqp.connect(RABBITMQ_URL, {
                    heartbeat: 30,
                    timeout: 5000
                });
                console.log('Connexion AMQP établie');
                
                this.connection.on('error', (err) => {
                    console.error('Erreur de connexion RabbitMQ:', err);
                    this.reconnect();
                });

                this.connection.on('close', () => {
                    console.log('Connexion RabbitMQ fermée');
                    this.reconnect();
                });

                this.channel = await this.connection.createChannel();
                console.log('Canal RabbitMQ créé');

                await this.channel.prefetch(1);
                
                for (const queue of Object.values(this.queues)) {
                    try {
                        await this.channel.checkQueue(queue);
                    } catch {
                        await this.channel.assertQueue(queue, { durable: true });
                    }
                }

                // Déclaration des échanges
                await this.channel.assertExchange(EXCHANGES.COMMAND, 'topic', { durable: true });
                await this.channel.assertExchange(EXCHANGES.PRODUCT, 'topic', { durable: true });
                await this.channel.assertExchange(EXCHANGES.CLIENT, 'topic', { durable: true });

                // Déclaration des queues
                for (const queue of Object.values(QUEUES)) {
                    await this.channel.assertQueue(queue, { durable: true });
                }

                // Binding des queues aux échanges
                // Produits
                await this.channel.bindQueue(QUEUES.PRODUCT_CREATED, EXCHANGES.PRODUCT, 'product.created');
                await this.channel.bindQueue(QUEUES.PRODUCT_UPDATED, EXCHANGES.PRODUCT, 'product.updated');
                await this.channel.bindQueue(QUEUES.PRODUCT_DELETED, EXCHANGES.PRODUCT, 'product.deleted');

                // Commandes
                await this.channel.bindQueue(QUEUES.ORDER_CREATED, EXCHANGES.COMMAND, 'order.created');
                await this.channel.bindQueue(QUEUES.ORDER_UPDATED, EXCHANGES.COMMAND, 'order.updated');
                await this.channel.bindQueue(QUEUES.ORDER_DELETED, EXCHANGES.COMMAND, 'order.deleted');

                // Clients
                await this.channel.bindQueue(QUEUES.CLIENT_CREATED, EXCHANGES.CLIENT, 'client.created');
                await this.channel.bindQueue(QUEUES.CLIENT_UPDATED, EXCHANGES.CLIENT, 'client.updated');
                await this.channel.bindQueue(QUEUES.CLIENT_DELETED, EXCHANGES.CLIENT, 'client.deleted');

                console.log('Connexion à RabbitMQ établie avec succès');
                this.isConnecting = false;
                return;
            } catch (error) {
                retries++;
                console.error(`Échec de la connexion à RabbitMQ (tentative ${retries}/${MAX_RETRIES}):`, error.message);
                
                if (retries === MAX_RETRIES) {
                    this.isConnecting = false;
                    throw new Error(`Impossible de se connecter à RabbitMQ après ${MAX_RETRIES} tentatives`);
                }
                
                console.log(`Nouvelle tentative dans ${RETRY_DELAY/1000} secondes...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
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
        
        setTimeout(() => {
            console.log('Tentative de reconnexion à RabbitMQ...');
            this.connect().catch(error => {
                console.error('Échec de la reconnexion:', error);
            });
        }, RETRY_DELAY);
    }

    async sendMessage(queueName, message) {
        if (!this.channel) {
            throw new Error('Channel non initialisé');
        }

        try {
            const queue = this.queues[queueName];
            if (!queue) {
                throw new Error(`Queue ${queueName} non trouvée`);
            }

            await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
            console.log(`Message envoyé à la queue ${queueName}`);
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            throw error;
        }
    }

    async listenToPort(port, callback) {
        if (!this.channel) {
            throw new Error('Channel non initialisé');
        }

        const queueName = `port${port}`;
        const queue = this.queues[queueName];
        
        if (!queue) {
            throw new Error(`Queue pour le port ${port} non trouvée`);
        }

        try {
            await this.channel.consume(queue, (msg) => {
                if (msg !== null) {
                    const content = JSON.parse(msg.content.toString());
                    console.log(`Message reçu du port ${port}:`, content);
                    callback(content);
                    this.channel.ack(msg);
                }
            });
            console.log(`Écoute active sur le port ${port}`);
        } catch (error) {
            console.error(`Erreur lors de l'écoute du port ${port}:`, error);
            throw error;
        }
    }

    async listenToPort3002(callback) {
        return this.listenToPort(3002, callback);
    }

    async listenToPort3003(callback) {
        return this.listenToPort(3003, callback);
    }

    async listenToPort3004(callback) {
        return this.listenToPort(3004, callback);
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

const rabbitmq = new RabbitMQService();
module.exports = {
    rabbitmq,
    initializeRabbitMQ: rabbitmq.connect,
    publishMessage: rabbitmq.sendMessage,
    consumeMessages: rabbitmq.listenToPort,
    EXCHANGES,
    QUEUES
}; 