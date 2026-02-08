package com.rent_vehicle.repository;

import com.rent_vehicle.model.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleTypeRepository extends JpaRepository<VehicleType, Long> {
    Optional<VehicleType> findByName(String name);
    List<VehicleType> findByNameContainingIgnoreCase(String name);
}
