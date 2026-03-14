package com.foodconnect.repository;
import com.foodconnect.model.WasteLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
public interface WasteLogRepository extends JpaRepository<WasteLog, Long> {
    List<WasteLog> findByUserIdOrderByLogDateDesc(Long userId);
    @Query("SELECT w FROM WasteLog w WHERE w.userId = :userId AND w.logDate >= :fromDate ORDER BY w.logDate ASC")
    List<WasteLog> findWeeklyLogs(Long userId, LocalDate fromDate);
}
