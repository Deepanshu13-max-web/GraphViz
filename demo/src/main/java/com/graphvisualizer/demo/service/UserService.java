package com.graphvisualizer.demo.service;
import com.graphvisualizer.demo.exception.ResourceNotFoundException;
import com.graphvisualizer.demo.model.entity.User;
import com.graphvisualizer.demo.repository.UserRepository;
import com.graphvisualizer.demo.repository.GraphRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
@Service
public class UserService {
    private final UserRepository userRepository;
    private final GraphRepository graphRepository;
    private final PasswordEncoder passwordEncoder;
    public UserService(UserRepository userRepository, GraphRepository graphRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.graphRepository = graphRepository;
        this.passwordEncoder = passwordEncoder;
    }
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " +
                        email));
    }
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
    @Transactional
    public User updateUser(String email, Map<String, String> updates) {
        User user = getUserByEmail(email);
        if (updates.containsKey("name")) {
            user.setName(updates.get("name"));}
        if (updates.containsKey("email") && !updates.get("email").equals(email)) {
// Check if new email already exists
            if (userRepository.existsByEmail(updates.get("email"))) {
                throw new RuntimeException("Email already in use");
            }
            user.setEmail(updates.get("email"));
        }
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    @Transactional
    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = getUserByEmail(email);
// Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }
// Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
    public Map<String, Object> getUserStats(String email) {
        User user = getUserByEmail(email);
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalGraphs", graphRepository.countByUserId(user.getId()));
        stats.put("memberSince", user.getCreatedAt());
        stats.put("lastUpdated", user.getUpdatedAt());
        return stats;
    }
    @Transactional
    public void deleteUser(String email) {
        User user = getUserByEmail(email);
        userRepository.delete(user);
    }
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);}
}