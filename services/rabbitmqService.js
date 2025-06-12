const amqp = require('amqplib');

class RabbitMQService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.queues = {
            productCreated: 'product.created',
            productUpdated: 'product.updated',
            productDeleted: 'product.deleted',
            stockUpdated: 'product.stock.updated'
        };
    }

    async connect() {
        try {
            this.connection = await amqp.connect(process.env.RABBITMQ_URL);
            this.channel = await this.connection.createChannel();
            
            await this.channel.assertQueue(this.queues.productCreated, { durable: true });
            await this.channel.assertQueue(this.queues.productUpdated, { durable: true });
            await this.channel.assertQueue(this.queues.productDeleted, { durable: true });
            await this.channel.assertQueue(this.queues.stockUpdated, { durable: true });

            console.log('Connected to RabbitMQ');
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
            throw error;
        }
    }

    async publishProductCreated(productData) {
        try {
            await this.channel.sendToQueue(
                this.queues.productCreated,
                Buffer.from(JSON.stringify(productData)),
                { persistent: true }
            );
            console.log('Published product created event');
        } catch (error) {
            console.error('Error publishing product created event:', error);
            throw error;
        }
    }

    async publishProductUpdated(productData) {
        try {
            await this.channel.sendToQueue(
                this.queues.productUpdated,
                Buffer.from(JSON.stringify(productData)),
                { persistent: true }
            );
            console.log('Published product updated event');
        } catch (error) {
            console.error('Error publishing product updated event:', error);
            throw error;
        }
    }

    async publishProductDeleted(productId) {
        try {
            await this.channel.sendToQueue(
                this.queues.productDeleted,
                Buffer.from(JSON.stringify({ productId })),
                { persistent: true }
            );
            console.log('Published product deleted event');
        } catch (error) {
            console.error('Error publishing product deleted event:', error);
            throw error;
        }
    }

    async publishStockUpdated(productId, newStock) {
        try {
            await this.channel.sendToQueue(
                this.queues.stockUpdated,
                Buffer.from(JSON.stringify({ productId, newStock })),
                { persistent: true }
            );
            console.log('Published stock updated event');
        } catch (error) {
            console.error('Error publishing stock updated event:', error);
            throw error;
        }
    }

    async close() {
        try {
            await this.channel.close();
            await this.connection.close();
            console.log('RabbitMQ connection closed');
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error);
            throw error;
        }
    }
}

module.exports = new RabbitMQService(); 