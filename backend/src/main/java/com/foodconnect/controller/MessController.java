package com.foodconnect.controller;

import com.foodconnect.model.MessMenu;
import com.foodconnect.model.WasteLog;
import com.foodconnect.repository.MessMenuRepository;
import com.foodconnect.repository.WasteLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MessController {

    private final MessMenuRepository menuRepo;
    private final WasteLogRepository wasteRepo;

    // ---- Menu ----
    @PostMapping("/mess/menu")
    public ResponseEntity<?> addMenu(@RequestBody MessMenu menu) {
        return ResponseEntity.ok(menuRepo.save(menu));
    }

    @GetMapping("/mess/menu/{userId}")
    public List<MessMenu> getMenus(@PathVariable Long userId) {
        return menuRepo.findByUserIdOrderByMenuDateDesc(userId);
    }

    // ---- Waste ----
    @PostMapping("/mess/waste")
    public ResponseEntity<?> logWaste(@RequestBody WasteLog log) {
        return ResponseEntity.ok(wasteRepo.save(log));
    }

    @GetMapping("/mess/waste/{userId}")
    public List<WasteLog> getWaste(@PathVariable Long userId) {
        return wasteRepo.findByUserIdOrderByLogDateDesc(userId);
    }

    // ---- Weekly Analytics ----
    @GetMapping("/analytics/weekly/{userId}")
    public ResponseEntity<?> weeklyAnalytics(@PathVariable Long userId) {
        LocalDate from = LocalDate.now().minusDays(6);
        List<WasteLog> logs = wasteRepo.findWeeklyLogs(userId, from);

        // Aggregate by date
        Map<LocalDate, Double[]> byDate = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = LocalDate.now().minusDays(i);
            byDate.put(d, new Double[]{0.0, 0.0});
        }
        logs.forEach(log -> {
            Double[] vals = byDate.getOrDefault(log.getLogDate(), new Double[]{0.0, 0.0});
            vals[0] += log.getCookedKg();
            vals[1] += log.getWastedKg();
            byDate.put(log.getLogDate(), vals);
        });

        List<String> labels = byDate.keySet().stream().map(d -> d.getMonthValue() + "/" + d.getDayOfMonth()).collect(Collectors.toList());
        List<Double> cooked = byDate.values().stream().map(v -> v[0]).collect(Collectors.toList());
        List<Double> wasted = byDate.values().stream().map(v -> v[1]).collect(Collectors.toList());
        double total = wasted.stream().mapToDouble(Double::doubleValue).sum();
        double avg = wasted.isEmpty() ? 0 : total / wasted.size();

        return ResponseEntity.ok(Map.of(
            "labels", labels, "cooked", cooked, "wasted", wasted,
            "totalWaste", total, "avgWaste", avg
        ));
    }
}
