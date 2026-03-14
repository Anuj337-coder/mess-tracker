package com.foodconnect.service;

import com.foodconnect.model.DonationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@foodconnect.in}")
    private String from;

    public void sendDonationStatusEmail(String toEmail, String donorName, DonationRequest req, String status) throws Exception {
        if (mailSender == null) return; // Email not configured — skip silently
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(from);
        helper.setTo(toEmail);

        boolean accepted = "ACCEPTED".equals(status);
        helper.setSubject(accepted
            ? "✅ Your FoodConnect Donation Was Accepted! — " + req.getReceiptCode()
            : "❌ FoodConnect Donation Update — " + req.getReceiptCode());

        String color = accepted ? "#10b981" : "#ef4444";
        String icon = accepted ? "✅" : "❌";
        String statusMsg = accepted
            ? "Great news! The NGO has accepted your donation and will arrange pickup."
            : "Unfortunately, the NGO was unable to accept your donation at this time.<br><strong>Reason:</strong> " + req.getRejectReason();

        String html = """
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f0f6ff;padding:20px">
              <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
                <div style="background:linear-gradient(135deg,#1a6ee8,#60aeff);padding:28px;text-align:center">
                  <h2 style="color:white;margin:0;font-size:1.5rem">🍱 FoodConnect</h2>
                  <p style="color:rgba(255,255,255,0.85);margin:6px 0 0">Food Waste Reduction Platform</p>
                </div>
                <div style="padding:28px">
                  <p style="font-size:1.1rem;color:#1a1a2e">Dear <strong>%s</strong>,</p>
                  <div style="background:%s15;border-left:4px solid %s;padding:16px;border-radius:8px;margin:20px 0">
                    <h3 style="color:%s;margin:0 0 8px">%s Donation %s</h3>
                    <p style="color:#3a4a6b;margin:0">%s</p>
                  </div>
                  <table style="width:100%%;background:#f0f6ff;border-radius:8px;padding:16px;font-size:0.9rem;color:#3a4a6b">
                    <tr><td><strong>Receipt #</strong></td><td>%s</td></tr>
                    <tr><td><strong>Food</strong></td><td>%s</td></tr>
                    <tr><td><strong>Quantity</strong></td><td>%s kg</td></tr>
                  </table>
                  %s
                  <p style="color:#6b7fa8;font-size:0.85rem;margin-top:24px">Thank you for being part of the food waste reduction movement! 🌱</p>
                </div>
                <div style="background:#f0f6ff;padding:16px;text-align:center;font-size:0.8rem;color:#6b7fa8">
                  © 2025 FoodConnect · Making India Food Waste Free
                </div>
              </div>
            </div>
        """.formatted(
            donorName, color, color, color, icon,
            accepted ? "Accepted!" : "Update",
            statusMsg,
            req.getReceiptCode(),
            req.getFoodDesc(),
            req.getQuantityKg(),
            accepted ? "<a href='#' style='display:inline-block;margin-top:16px;background:linear-gradient(135deg,#1a6ee8,#60aeff);color:white;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:600'>View Donation History →</a>" : ""
        );

        helper.setText(html, true);
        mailSender.send(message);
    }
}
