package com.rent_vehicle.repository;

import com.rent_vehicle.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    
    List<Vehicle> findByVehicleModelId(Long vehicleModelId);
    
    List<Vehicle> findByStatus(Vehicle.VehicleStatus status);
    
    @Query("SELECT v FROM Vehicle v WHERE v.vehicleModel.id = ?1 AND v.status = ?2")
    List<Vehicle> findAvailableByModelId(Long vehicleModelId, Vehicle.VehicleStatus status);

    @Query("""
    SELECT v FROM Vehicle v
    WHERE v.vehicleModel.id = :vehicleModelId
      AND v.status = :status
      AND LOWER(v.location) = LOWER(:location)
    """)
    List<Vehicle> findAvailableByModelIdAndLocation(
            @org.springframework.data.repository.query.Param("vehicleModelId") Long vehicleModelId,
            @org.springframework.data.repository.query.Param("status") Vehicle.VehicleStatus status,
            @org.springframework.data.repository.query.Param("location") String location
    );
    
    long countByVehicleModelIdAndStatus(Long vehicleModelId, Vehicle.VehicleStatus status);

    @Query("SELECT v FROM Vehicle v WHERE UPPER(v.licensePlate) LIKE UPPER(CONCAT('%', ?1, '%'))")
    List<Vehicle> findByLicensePlateLikeIgnoreCase(String keyword);

        org.springframework.data.domain.Page<Vehicle> findByLicensePlateContainingIgnoreCase(String keyword, org.springframework.data.domain.Pageable pageable);
}
