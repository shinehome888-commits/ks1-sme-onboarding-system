const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'ks1-onboarding-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const producer = kafka.producer();

const initProducer = async () => {
  await producer.connect();
  console.log('✅ Kafka Producer connected');
};

initProducer().catch(console.error);

module.exports = { producer };
