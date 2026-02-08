package com.rent_vehicle.repository;

import com.rent_vehicle.model.VehicleModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleModelRepository extends JpaRepository<VehicleModel, Long> {
    Optional<VehicleModel> findByName(String name);
    
    List<VehicleModel> findByVehicleTypeId(Long vehicleTypeId);
    
    List<VehicleModel> findByNameContainingIgnoreCase(String name);
    
    List<VehicleModel> findByBrandContainingIgnoreCase(String brand);
    
    @Query("SELECT vm FROM VehicleModel vm WHERE LOWER(vm.name) LIKE LOWER(CONCAT('%', ?1, '%')) OR LOWER(vm.brand) LIKE LOWER(CONCAT('%', ?1, '%'))")
    List<VehicleModel> searchByNameOrBrand(String keyword);
    
    Page<VehicleModel> findByNameLikeIgnoreCaseOrBrandLikeIgnoreCase(String name, String brand, Pageable pageable);
}
