package com.fitness.aiService.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.retry.RejectAndDontRequeueRecoverer;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    @Value("${rabbitmq.exchange.name:fitness.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing.key:activity.tracking}")
    private String routingKey;

    @Value("${rabbitmq.queue.name:activity.queue}")
    private String queue;

    @Value("${rabbitmq.dlx.exchange.name:fitness.exchange.dlx}")
    private String dlxExchange;

    @Value("${rabbitmq.dlx.routing.key:activity.tracking.dlq}")
    private String dlqRoutingKey;

    @Value("${rabbitmq.dlx.queue.name:activity.queue.dlq}")
    private String dlqQueue;

    @Value("${spring.rabbitmq.addresses:${CLOUDAMQP_URL:${RABBITMQ_URL:${SPRING_RABBITMQ_ADDRESSES:${SPRING_RABBITMQ_URI:}}}}}")
    private String rabbitmqUrl;

    @Value("${spring.rabbitmq.host:localhost}")
    private String rabbitmqHost;

    @Value("${spring.rabbitmq.port:5672}")
    private int rabbitmqPort;

    @Value("${spring.rabbitmq.username:guest}")
    private String rabbitmqUsername;

    @Value("${spring.rabbitmq.password:guest}")
    private String rabbitmqPassword;

    @Value("${spring.rabbitmq.virtual-host:/}")
    private String rabbitmqVirtualHost;

    @Bean
    public ConnectionFactory connectionFactory() {
        String url = rabbitmqUrl;
        if (url == null || url.isBlank()) {
            url = System.getenv("CLOUDAMQP_URL");
        }
        if (url == null || url.isBlank()) {
            url = System.getenv("RABBITMQ_URL");
        }
        if (url == null || url.isBlank()) {
            url = System.getenv("SPRING_RABBITMQ_ADDRESSES");
        }

        if (url != null && !url.isBlank() && (url.startsWith("amqp://") || url.startsWith("amqps://"))) {
            try {
                com.rabbitmq.client.ConnectionFactory rcf = new com.rabbitmq.client.ConnectionFactory();
                rcf.setUri(url.trim());
                org.springframework.amqp.rabbit.connection.CachingConnectionFactory factory =
                        new org.springframework.amqp.rabbit.connection.CachingConnectionFactory(rcf);
                factory.setUsername(rcf.getUsername());
                factory.setPassword(rcf.getPassword());
                factory.setVirtualHost(rcf.getVirtualHost());
                factory.setHost(rcf.getHost());
                factory.setPort(rcf.getPort());
                return factory;
            } catch (Exception e) {
                org.springframework.amqp.rabbit.connection.CachingConnectionFactory factory =
                        new org.springframework.amqp.rabbit.connection.CachingConnectionFactory();
                factory.setUri(url.trim());
                return factory;
            }
        }

        org.springframework.amqp.rabbit.connection.CachingConnectionFactory factory =
                new org.springframework.amqp.rabbit.connection.CachingConnectionFactory(rabbitmqHost, rabbitmqPort);
        factory.setUsername(rabbitmqUsername);
        factory.setPassword(rabbitmqPassword);
        factory.setVirtualHost(rabbitmqVirtualHost);
        return factory;
    }

    // Main Activity Queue with Dead-Letter Exchange arguments
    @Bean
    public Queue activityQueue() {
        return QueueBuilder.durable(queue)
                .withArgument("x-dead-letter-exchange", dlxExchange)
                .withArgument("x-dead-letter-routing-key", dlqRoutingKey)
                .build();
    }

    @Bean
    public DirectExchange activityExchange() {
        return new DirectExchange(exchange);
    }

    @Bean
    public Binding activityBinding(Queue activityQueue, DirectExchange activityExchange) {
        return BindingBuilder.bind(activityQueue)
                .to(activityExchange)
                .with(routingKey);
    }

    // Dead-Letter Infrastructure
    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(dlxExchange);
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(dlqQueue).build();
    }

    @Bean
    public Binding deadLetterBinding(Queue deadLetterQueue, DirectExchange deadLetterExchange) {
        return BindingBuilder.bind(deadLetterQueue)
                .to(deadLetterExchange)
                .with(dlqRoutingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter jsonMessageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter);
        factory.setDefaultRequeueRejected(false);
        factory.setMissingQueuesFatal(false);
        factory.setContainerCustomizer(container -> container.setPossibleAuthenticationFailureFatal(false));
        return factory;
    }
}

