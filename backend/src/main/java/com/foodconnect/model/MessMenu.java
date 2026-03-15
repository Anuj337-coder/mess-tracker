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

    @OneToMany(mappedBy = "messMenu", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private java.util.List<MessMenuItem> menuItems = new java.util.ArrayList<>();

    private Integer servingsPlanned;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum MealType { BREAKFAST, LUNCH, DINNER, SNACKS }
}
