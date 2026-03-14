package com.foodconnect.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "donation_requests")
@Data
@NoArgsConstructor
public class DonationRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receipt_code", nullable = false, unique = true)
    private String receiptCode;

    @Column(name = "donor_id", nullable = false)
    private Long donorId;

    @Column(name = "ngo_id", nullable = false)
    private Long ngoId;

    @Column(name = "food_desc", length = 500)
    private String foodDesc;

    @Column(name = "quantity_kg")
    private Double quantityKg;

    @Column(name = "pickup_note", length = 500)
    private String pickupNote;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() { updatedAt = LocalDateTime.now(); }

    public enum Status { PENDING, ACCEPTED, REJECTED }
}
