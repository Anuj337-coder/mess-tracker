package com.foodconnect.service;

import com.foodconnect.model.Notification;
import com.foodconnect.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notifRepo;

    public Notification save(Long userId, String message) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setMessage(message);
        return notifRepo.save(n);
    }

    public List<Notification> getForUser(Long userId) {
        return notifRepo.findByUserIdOrderBySentAtDesc(userId);
    }

    public void markRead(Long id) {
        notifRepo.findById(id).ifPresent(n -> {
            n.setIsRead(true);
            notifRepo.save(n);
        });
    }
}
