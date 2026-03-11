package com.longne.tourapplication.listener;

import com.longne.tourapplication.entity.Booking;
import com.longne.tourapplication.repository.BookingRepository;
import com.longne.tourapplication.service.EmailService;
import com.rabbitmq.client.Channel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailListener {
    private final EmailService emailService;
    private final BookingRepository bookingRepository;

    @RabbitListener(queues = "email_sending_queue")
    public void processEmailQueue(String message, Channel channel, @Header(AmqpHeaders.DELIVERY_TAG) long tag) throws IOException {
        log.info("Bắt đầu gửi email cho tin nhắn: {}", message);

        try {
            Thread.sleep(1500);
            String[] part = message.split("\\|");

            if(part.length < 2){
                log.warn("Sai định dạng message: {}", message);
                channel.basicNack(tag, false, false);
                return;
            }

            String emailType = part[0];
            String bookingCode = part[1];

            Booking booking = bookingRepository.findByBookingCodeWithTourAndSchedule(bookingCode)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy booking trong Consumer"));

            switch (emailType){
                case "CONFIRM":
                    emailService.sendBookingConfirmation(booking);
                    break;
                case "SUCCESS":
                    emailService.sendPaymentSuccess(booking);
                    break;
                case "FAILED":
                    emailService.sendPaymentFailed(booking);
                    break;
                default:
                    log.warn("Loại email không được hỗ trợ: {}", emailType);
                    channel.basicNack(tag, false, false);
            }
            log.info("Gửi email {} thành công cho booking: {}", emailType, bookingCode);
            channel.basicAck(tag, false);
        }catch (Exception e){
            log.error("Lỗi khi gửi email qua RabbitMQ: {}", e.getMessage());
            channel.basicNack(tag, false, true);
        }
    }
}
