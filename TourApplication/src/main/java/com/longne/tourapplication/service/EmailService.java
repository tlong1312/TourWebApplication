package com.longne.tourapplication.service;

import com.longne.tourapplication.entity.Booking;
import com.longne.tourapplication.entity.BookingParticipant;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.name:Tour Application}")
    private String appName;

    @Value("${app.url}")
    private String appUrl;

    @Async
    public void sendBookingConfirmation(Booking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, appName);
            helper.setTo(booking.getContactEmail());
            helper.setSubject("Xác nhận đặt tour - " + booking.getBookingCode());
            helper.setText(buildBookingConfirmationEmail(booking), true);

            mailSender.send(message);
            log.info("Đã gửi email xác nhận booking: {}", booking.getBookingCode());
        } catch (Exception e) {
            log.error("Lỗi gửi email xác nhận booking {}: {}", booking.getBookingCode(), e.getMessage(), e);
        }
    }

    @Async
    public void sendPaymentSuccess(Booking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, appName);
            helper.setTo(booking.getContactEmail());
            helper.setSubject("Thanh toán thành công - " + booking.getBookingCode());
            helper.setText(buildPaymentSuccessEmail(booking), true);

            mailSender.send(message);
            log.info("Đã gửi email thanh toán thành công: {}", booking.getBookingCode());
        } catch (Exception e) {
            log.error("Lỗi gửi email thanh toán {}: {}", booking.getBookingCode(), e.getMessage(), e);
        }
    }

    @Async
    public void sendPaymentFailed(Booking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, appName);
            helper.setTo(booking.getContactEmail());
            helper.setSubject("Thanh toán thất bại - " + booking.getBookingCode());
            helper.setText(buildPaymentFailedEmail(booking), true);

            mailSender.send(message);
            log.info("Đã gửi email thanh toán thất bại: {}", booking.getBookingCode());
        } catch (Exception e) {
            log.error("Lỗi gửi email thanh toán thất bại {}: {}", booking.getBookingCode(), e.getMessage(), e);
        }
    }

    private String buildPaymentFailedEmail(Booking booking) {
        return String.format("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #f44336; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .info-row { padding: 10px 0; border-bottom: 1px solid #ddd; }
                .label { font-weight: bold; color: #555; }
                .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✗ Thanh Toán Thất Bại</h1>
                </div>
                <div class="content">
                    <p>Xin chào <strong>%s</strong>,</p>
                    <p>Thanh toán cho booking <strong>%s</strong> đã thất bại. Đơn đặt tour của bạn đã bị hủy.</p>
                    <div class="info-row">
                        <span class="label">Tour:</span> %s
                    </div>
                    <div class="info-row">
                        <span class="label">Ngày khởi hành:</span> %s
                    </div>
                    <div class="info-row">
                        <span class="label">Trạng thái:</span> <span style="color: red;">Đã hủy</span>
                    </div>
                    <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ: %s</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 %s. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """,
                booking.getContactName(),
                booking.getBookingCode(),
                booking.getTour().getName(),
                booking.getTourSchedule().getDepartureDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                fromEmail,
                appName
        );
    }

    private String buildBookingConfirmationEmail(Booking booking) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter datetimeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .info-row { padding: 10px 0; border-bottom: 1px solid #ddd; }
                    .label { font-weight: bold; color: #555; }
                    .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
                    .button { background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; 
                              display: inline-block; margin: 20px 0; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Xác Nhận Đặt Tour</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Cảm ơn bạn đã đặt tour tại <strong>%s</strong>. Chúng tôi đã nhận được yêu cầu của bạn.</p>
                        
                        <h3>Thông tin booking:</h3>
                        <div class="info-row">
                            <span class="label">Mã booking:</span> %s
                        </div>
                        <div class="info-row">
                            <span class="label">Tour:</span> %s
                        </div>
                        <div class="info-row">
                            <span class="label">Ngày khởi hành:</span> %s
                        </div>
                        <div class="info-row">
                            <span class="label">Ngày về:</span> %s
                        </div>
                        <div class="info-row">
                            <span class="label">Số lượng:</span> %d người lớn, %d trẻ em, %d trẻ nhỏ
                        </div>
                        <div class="info-row">
                            <span class="label">Tổng tiền:</span> <strong>%s</strong>
                        </div>
                        <div class="info-row">
                            <span class="label">Trạng thái:</span> <span style="color: orange;">Chờ thanh toán</span>
                        </div>
                        
                        <p style="margin-top: 20px;">Vui lòng hoàn tất thanh toán để xác nhận booking của bạn.</p>
                    </div>
                    <div class="footer">
                        <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ: %s</p>
                        <p>&copy; 2024 %s. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
                booking.getContactName(),
                appName,
                booking.getBookingCode(),
                booking.getTour().getName(),
                booking.getTourSchedule().getDepartureDate().format(dateFormatter),
                booking.getTourSchedule().getReturnDate().format(dateFormatter),
                booking.getNumAdults(),
                booking.getNumChildren(),
                booking.getNumInfants(),
                currencyFormat.format(booking.getTotalPrice()),
                fromEmail,
                appName
        );
    }

    private String buildPaymentSuccessEmail(Booking booking) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
                    .success-badge { background: #4CAF50; color: white; padding: 10px 20px; 
                                     border-radius: 5px; display: inline-block; margin: 20px 0; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .info-row { padding: 10px 0; border-bottom: 1px solid #ddd; }
                    .label { font-weight: bold; color: #555; }
                    .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✓ Thanh Toán Thành Công</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>%s</strong>,</p>
                        <div class="success-badge">
                            Thanh toán của bạn đã được xác nhận thành công!
                        </div>
                        
                        <h3>Chi tiết booking:</h3>
                        <div class="info-row">
                            <span class="label">Mã booking:</span> %s
                        </div>
                        <div class="info-row">
                            <span class="label">Tour:</span> %s
                        </div>
                        <div class="info-row">
                            <span class="label">Ngày khởi hành:</span> %s
                        </div>
                        <div class="info-row">
                            <span class="label">Số tiền đã thanh toán:</span> <strong>%s</strong>
                        </div>
                        <div class="info-row">
                            <span class="label">Trạng thái:</span> <span style="color: green;">Đã xác nhận</span>
                        </div>
                        
                        <p style="margin-top: 20px;">Chúng tôi sẽ liên hệ với bạn trước ngày khởi hành để cung cấp 
                           thông tin chi tiết về chuyến đi.</p>
                        <p>Chúc bạn có một chuyến đi vui vẻ!</p>
                    </div>
                    <div class="footer">
                        <p>Liên hệ hỗ trợ: %s</p>
                        <p>&copy; 2024 %s. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
                booking.getContactName(),
                booking.getBookingCode(),
                booking.getTour().getName(),
                booking.getTourSchedule().getDepartureDate().format(dateFormatter),
                currencyFormat.format(booking.getFinalPrice()),
                fromEmail,
                appName
        );
    }
}
