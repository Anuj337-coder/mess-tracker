package com.foodconnect.repository;
import com.foodconnect.model.DonationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface DonationRequestRepository extends JpaRepository<DonationRequest, Long> {
    List<DonationRequest> findByDonorIdOrderByCreatedAtDesc(Long donorId);
    List<DonationRequest> findByNgoIdOrderByCreatedAtDesc(Long ngoId);
    List<DonationRequest> findByNgoIdAndStatusOrderByCreatedAtDesc(Long ngoId, DonationRequest.Status status);
}
