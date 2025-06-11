until rabbitmqctl status; do
  echo "En attente de RabbitMQ..."
  sleep 2
done

rabbitmqadmin declare queue name=queue_port_3001 durable=true
rabbitmqadmin declare queue name=queue_port_3002 durable=true
rabbitmqadmin declare queue name=queue_port_3003 durable=true

rabbitmqadmin declare exchange name=produit_exchange type=direct durable=true
rabbitmqadmin declare exchange name=commande_exchange type=direct durable=true
rabbitmqadmin declare exchange name=client_exchange type=direct durable=true

rabbitmqadmin declare binding source=produit_exchange destination=queue_port_3001 routing_key=produit
rabbitmqadmin declare binding source=commande_exchange destination=queue_port_3002 routing_key=commande
rabbitmqadmin declare binding source=client_exchange destination=queue_port_3003 routing_key=client

echo "Initialisation de RabbitMQ terminée" 