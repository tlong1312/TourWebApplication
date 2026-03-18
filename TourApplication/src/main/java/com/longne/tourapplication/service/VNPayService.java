package com.longne.tourapplication.service;

import com.longne.tourapplication.config.VNPayConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.util.StringBuilders;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayService {

    private final VNPayConfig vnPayConfig;

    public String createPaymentUrl(String bookingCode, Long amount, String orderInfo, String ipAddress) {
        try {
            Map<String, String> vnpParams = new TreeMap<>(); // TreeMap auto-sorts by key

            vnpParams.put("vnp_Version", vnPayConfig.getVersion());
            vnpParams.put("vnp_Command", vnPayConfig.getCommand());
            vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            vnpParams.put("vnp_Amount", String.valueOf(amount * 100)); // VNPay requires amount * 100
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", bookingCode);
            vnpParams.put("vnp_OrderInfo", orderInfo);
            vnpParams.put("vnp_OrderType", vnPayConfig.getOrderType());
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
            vnpParams.put("vnp_IpAddr", ipAddress);
            String vnpCreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
            vnpParams.put("vnp_CreateDate", vnpCreateDate);
            StringBuilder query = new StringBuilder();
            for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
                if (query.length() > 0) {
                    query.append('&');
                }
                query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
                query.append('=');
                query.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
            }
            String signData = query.toString();
            String vnpSecureHash = hmacSHA512(vnPayConfig.getHashSecret(), signData);
            String paymentUrl = vnPayConfig.getVnpUrl() + "?" + query.toString() +
                    "&vnp_SecureHash=" + vnpSecureHash;

            log.info("VNPay Payment URL: {}", paymentUrl);
            return paymentUrl;

        } catch (Exception e) {
            log.error("Error creating VNPay URL: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tạo URL thanh toán");
        }
    }


    public boolean verifyPayment(Map<String, String> params) {
        try {
            String vnpSecureHash = params.get("vnp_SecureHash");
            params.remove("vnp_SecureHash");
            params.remove("vnp_SecureHashType");
            Map<String, String> sortedParams = new TreeMap<>(params);
            StringBuilder signData = new StringBuilder();
            for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
                if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                    if (signData.length() > 0) {
                        signData.append('&');
                    }
                    signData.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
                    signData.append('=');
                    signData.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
                }
            }

            String calculatedHash = hmacSHA512(vnPayConfig.getHashSecret(), signData.toString());

            log.info("VNPay verify - Received hash: {}", vnpSecureHash);
            log.info("VNPay verify - Calculated hash: {}", calculatedHash);

            return calculatedHash.equalsIgnoreCase(vnpSecureHash);

        } catch (Exception e) {
            log.error("Error verifying payment: {}", e.getMessage(), e);
            return false;
        }
    }


    private String hmacSHA512(String key, String data) {
        try{
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder sb = new StringBuilder();
            for (byte b : result) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        }catch (Exception e){
            throw new RuntimeException("Lỗi tạo HMAC SHA512: " + e.getMessage(), e);
        }
    }
}
