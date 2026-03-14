package com.foodconnect.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "waste_logs")
@Data
@NoArgsConstructor
public class WasteLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    private Long menuId;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Enumerated(EnumType.STRING)
    private MessMenu.MealType mealType;

    @Column(name = "food_item", nullable = false)
    private String foodItem;

    @Column(name = "cooked_kg", nullable = false)
    private Double cookedKg;

    @Column(name = "wasted_kg", nullable = false)
    private Double wastedKg;

    private String notes;

    private LocalDateTime loggedAt = LocalDateTime.now();
}
