package com.rent_vehicle.repository;

import com.rent_vehicle.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    List<User> findByFullNameContainingIgnoreCase(String fullName);
    
    List<User> findByRole(User.Role role);
    
    List<User> findByStatus(User.Status status);
    
    @Query("SELECT u FROM User u WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', ?1, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', ?1, '%'))")
    List<User> searchUser(String keyword);
    
    boolean existsByEmail(String email);
    
    long countByRole(User.Role role);
}
