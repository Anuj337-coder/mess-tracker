package com.foodconnect.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ngo_profiles")
@Data
@NoArgsConstructor
public class NGOProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "ngo_name", nullable = false)
    private String ngoName;

    private String location;

    @Column(length = 500)
    private String accepts;

    private String contactEmail;
    private String contactPhone;
    private Double rating = 5.0;
    private Boolean isVerified = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}
