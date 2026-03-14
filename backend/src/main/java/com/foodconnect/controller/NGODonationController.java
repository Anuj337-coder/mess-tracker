package com.foodconnect.controller;

import com.foodconnect.model.*;
import com.foodconnect.repository.*;
import com.foodconnect.service.EmailService;
import com.foodconnect.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NGODonationController {

    private final NGOProfileRepository ngoRepo;
    private final DonationRequestRepository donationRepo;
    private final UserRepository userRepo;
    private final EmailService emailService;
    private final NotificationService notifService;

    // ---- NGOs ----
    @GetMapping("/ngo/all")
    public List<NGOProfile> getAllNGOs() {
        return ngoRepo.findAllByOrderByRatingDesc();
    }

    @GetMapping("/ngo/{id}")
    public ResponseEntity<?> getNGO(@PathVariable Long id) {
        return ngoRepo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/ngo/{id}")
    public ResponseEntity<?> updateNGO(@PathVariable Long id, @RequestBody NGOProfile updated) {
        return ngoRepo.findById(id).map(ngo -> {
            if (updated.getNgoName() != null) ngo.setNgoName(updated.getNgoName());
            if (updated.getLocation() != null) ngo.setLocation(updated.getLocation());
            if (updated.getAccepts() != null) ngo.setAccepts(updated.getAccepts());
            if (updated.getContactEmail() != null) ngo.setContactEmail(updated.getContactEmail());
            if (updated.getContactPhone() != null) ngo.setContactPhone(updated.getContactPhone());
            return ResponseEntity.ok(ngoRepo.save(ngo));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ngo/{ngoId}/requests")
    public List<DonationRequest> getNGORequests(@PathVariable Long ngoId) {
        return donationRepo.findByNgoIdOrderByCreatedAtDesc(ngoId);
    }

    // ---- Donations ----
    @PostMapping("/donation/request")
    public ResponseEntity<?> submitDonation(@RequestBody DonationRequest req) {
        req.setReceiptCode("FC-" + System.currentTimeMillis() % 1000000);
        req.setStatus(DonationRequest.Status.PENDING);
        DonationRequest saved = donationRepo.save(req);

        // Notify NGO user
        ngoRepo.findById(req.getNgoId()).ifPresent(ngo -> {
            notifService.save(ngo.getUserId(), "📥 New donation request received! Check your dashboard.");
        });
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/donation/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return donationRepo.findById(id).map(req -> {
            DonationRequest.Status newStatus = DonationRequest.Status.valueOf(body.get("status"));
            req.setStatus(newStatus);
            if (body.containsKey("reason")) req.setRejectReason(body.get("reason"));
            DonationRequest saved = donationRepo.save(req);

            // Notify donor and send email
            userRepo.findById(req.getDonorId()).ifPresent(donor -> {
                String msg = newStatus == DonationRequest.Status.ACCEPTED
                    ? "✅ Your donation request " + req.getReceiptCode() + " was ACCEPTED by the NGO!"
                    : "❌ Your donation request " + req.getReceiptCode() + " was rejected. Reason: " + req.getRejectReason();
                notifService.save(donor.getId(), msg);
                try { emailService.sendDonationStatusEmail(donor.getEmail(), donor.getName(), req, newStatus.name()); } catch (Exception ignored) {}
            });
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/donation/history/{userId}")
    public List<DonationRequest> getDonationHistory(@PathVariable Long userId) {
        return donationRepo.findByDonorIdOrderByCreatedAtDesc(userId);
    }
}
