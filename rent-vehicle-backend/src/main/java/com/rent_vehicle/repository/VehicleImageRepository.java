package com.rent_vehicle.repository;

import com.rent_vehicle.model.VehicleImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleImageRepository extends JpaRepository<VehicleImage, Long> {
    List<VehicleImage> findByVehicleModelId(Long vehicleModelId);
    void deleteByVehicleModelId(Long vehicleModelId);
}
