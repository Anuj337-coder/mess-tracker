package com.foodconnect.repository;
import com.foodconnect.model.NGOProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface NGOProfileRepository extends JpaRepository<NGOProfile, Long> {
    Optional<NGOProfile> findByUserId(Long userId);
    List<NGOProfile> findAllByOrderByRatingDesc();
}
