package com.longne.tourapplication.config;

import org.springframework.ai.chat.memory.repository.jdbc.JdbcChatMemoryRepository;
import org.springframework.ai.chat.memory.repository.jdbc.MysqlChatMemoryRepositoryDialect;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class ChatMemoryConfig {

    /**
     * JdbcTemplate cho Chat Memory - sử dụng MySQL (Primary DataSource)
     */
    @Bean(name = "chatMemoryJdbcTemplate")
    public JdbcTemplate chatMemoryJdbcTemplate(@Qualifier("primaryDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    /**
     * Chat Memory Repository với MySQL dialect
     */
    @Bean
    public JdbcChatMemoryRepository chatMemoryRepository(
            @Qualifier("chatMemoryJdbcTemplate") JdbcTemplate jdbcTemplate) {

        return JdbcChatMemoryRepository.builder()
                .jdbcTemplate(jdbcTemplate)
                .dialect(new MysqlChatMemoryRepositoryDialect())
                .build();
    }
}