package com.longne.tourapplication;

import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.client.RestClientCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;

@SpringBootApplication(exclude = {
        org.springframework.ai.vectorstore.pgvector.autoconfigure.PgVectorStoreAutoConfiguration.class
})
@EnableCaching
public class TourApplication {

    public static void main(String[] args) {
        SpringApplication.run(TourApplication.class, args);
    }
    @Bean
    public RestClientCustomizer restClientCustomizer(@Value("${gemini.api-key}") String geminiKey) {
        return restClientBuilder -> restClientBuilder
                .requestInterceptor((request, body, execution) -> {

                    // Nếu đích đến là Google (Gemini)
                    if (request.getURI().toString().contains("googleapis.com")) {
                        System.out.println("🔄 Đang gọi Google Gemini -> Tráo sang Key Gemini...");
                        // Xóa key cũ (của Groq) và nạp key Gemini vào
                        request.getHeaders().set(HttpHeaders.AUTHORIZATION, "Bearer " + geminiKey);
                    }
                    // Nếu không phải Google (tức là Groq) thì kệ nó, để nó dùng key mặc định

                    return execution.execute(request, body);
                });
    }
}
