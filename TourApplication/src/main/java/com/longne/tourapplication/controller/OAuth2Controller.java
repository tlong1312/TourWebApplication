package com.longne.tourapplication.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OAuth2Controller {
    @GetMapping("/oauth2/redirect")
    public String oauth2Redirect(
            @RequestParam String token,
            @RequestParam("refresh_token") String refreshToken) {
        return """
                <html>
                <body>
                    <h2>Login Successful!</h2>
                    <p><strong>Access Token:</strong><br>%s</p>
                    <p><strong>Refresh Token:</strong><br>%s</p>
                    <hr>
                    <p>Copy token và test API protected bằng Postman:</p>
                    <code>Authorization: Bearer %s</code>
                </body>
                </html>
                """.formatted(token, refreshToken, token);
    }
}
