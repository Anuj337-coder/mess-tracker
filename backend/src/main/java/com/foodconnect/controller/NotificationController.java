package com.foodconnect.controller;

import com.foodconnect.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notifService;

    @GetMapping("/{userId}")
    public List<?> getAll(@PathVariable Long userId) {
        return notifService.getForUser(userId);
    }

    @PutMapping("/{id}/read")
    public void markRead(@PathVariable Long id) {
        notifService.markRead(id);
    }
}
