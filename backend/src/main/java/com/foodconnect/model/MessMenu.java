package com.foodconnect.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "mess_menus")
@Data
@NoArgsConstructor
public class MessMenu {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "menu_date", nullable = false)
    private LocalDate menuDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false)
    private MealType mealType;

    @Column(nullable = false, length = 1000)
    private String items;

    private Integer servingsPlanned;
    private Double qtyKg;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum MealType { BREAKFAST, LUNCH, DINNER, SNACKS }
}
