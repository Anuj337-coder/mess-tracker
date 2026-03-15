package com.foodconnect.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "mess_menu_items")
@Data
@NoArgsConstructor
public class MessMenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", nullable = false)
    @JsonBackReference
    @ToString.Exclude
    private MessMenu messMenu;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "qty_kg", nullable = false)
    private Double qtyKg;
}
