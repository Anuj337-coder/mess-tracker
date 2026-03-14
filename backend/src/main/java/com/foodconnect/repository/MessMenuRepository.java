package com.foodconnect.repository;
import com.foodconnect.model.MessMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface MessMenuRepository extends JpaRepository<MessMenu, Long> {
    List<MessMenu> findByUserIdOrderByMenuDateDesc(Long userId);
}
