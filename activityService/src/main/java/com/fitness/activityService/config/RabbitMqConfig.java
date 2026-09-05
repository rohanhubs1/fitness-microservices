package com.fitness.activityService.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    @Value("${rabbitmq.exchange.name}")
    private String exchange;

    @Value("${rabbitmq.routing.key}")
    private String routingKey;

    @Value("${rabbitmq.queue.name}")
    private String queue;

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
    public org.springframework.amqp.rabbit.connection.ConnectionFactory connectionFactory() {
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
                java.net.URI uri = new java.net.URI(url);
                org.springframework.amqp.rabbit.connection.CachingConnectionFactory factory =
                        new org.springframework.amqp.rabbit.connection.CachingConnectionFactory();

                if (uri.getHost() != null) {
                    factory.setHost(uri.getHost());
                }
                if (uri.getPort() > 0) {
                    factory.setPort(uri.getPort());
                } else {
                    factory.setPort("amqps".equalsIgnoreCase(uri.getScheme()) ? 5671 : 5672);
                }

                String userInfo = uri.getUserInfo();
                if (userInfo != null && !userInfo.isBlank()) {
                    String[] parts = userInfo.split(":", 2);
                    factory.setUsername(parts[0]);
                    if (parts.length > 1) {
                        factory.setPassword(parts[1]);
                    }
                }

                String path = uri.getPath();
                if (path != null && path.length() > 1) {
                    factory.setVirtualHost(path.substring(1));
                }

                if ("amqps".equalsIgnoreCase(uri.getScheme())) {
                    factory.getRabbitConnectionFactory().useSslProtocol();
                }

                return factory;
            } catch (Exception e) {
                org.springframework.amqp.rabbit.connection.CachingConnectionFactory factory =
                        new org.springframework.amqp.rabbit.connection.CachingConnectionFactory();
                factory.setUri(url);
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

    @Bean
    public Queue activityQueue(){
        return new Queue(queue, true);
    }

    @Bean
    public DirectExchange acitvityExchange(){
        return new DirectExchange(exchange);
    }

    @Bean
    public Binding activityBinding(Queue activityQueue, DirectExchange activityExchange){
        return BindingBuilder.bind(activityQueue)
                .to(activityExchange)
                .with(routingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter(){
        return new JacksonJsonMessageConverter();
    }
}
