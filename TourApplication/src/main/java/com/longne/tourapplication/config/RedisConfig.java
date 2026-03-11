package com.longne.tourapplication.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
@EnableCaching
public class RedisConfig {

    @Bean
    public RedisCacheConfiguration cacheConfiguration() {
        // 1. Tạo Mapper riêng tư (Private) cho Redis
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        // Kích hoạt Type Info (Lưu tên Class vào JSON)
        BasicPolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                .allowIfBaseType(Object.class)
                .build();
        mapper.activateDefaultTyping(ptv, ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);

        // 2. Tạo Serializer từ Mapper trên
        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(mapper);

        // 3. Trả về cấu hình Cache đã gắn Serializer
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1))
                .disableCachingNullValues()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer));
    }

    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
        // Chúng ta phải gọi lại logic tạo Serializer ở trên để áp dụng cho các cache con
        // (Hơi lặp lại xíu nhưng chắc chắn chạy)
        return builder -> {
            // Copy logic tạo mapper/serializer y hệt ở trên để đảm bảo đồng bộ
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            BasicPolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                    .allowIfBaseType(Object.class)
                    .build();
            mapper.activateDefaultTyping(ptv, ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);
            GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(mapper);

            // Cấu hình cho từng cache name cụ thể
            builder
                    .withCacheConfiguration("tour_detail",
                            RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofDays(1))
                                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer)))
                    .withCacheConfiguration("tour_list",
                            RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofDays(1))
                                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer)))
                    .withCacheConfiguration("categories",
                            RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofDays(7))
                                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer)))
                    .withCacheConfiguration("revenue_stats",
                            RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(10))
                                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer)));
        };
    }
}
