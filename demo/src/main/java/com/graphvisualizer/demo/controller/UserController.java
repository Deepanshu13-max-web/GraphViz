package com.graphvisualizer.demo.controller;
import com.graphvisualizer.demo.model.entity.User;
import com.graphvisualizer.demo.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "https://magnificent-art-production.up.railway.app/")
public class UserController {
    private final UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            User user = userService.getUserByEmail(userDetails.getUsername());
            Map<String, Object> profile = new HashMap<>();
            profile.put("id", user.getId());
            profile.put("name", user.getName());
            profile.put("email", user.getEmail());
            profile.put("createdAt", user.getCreatedAt());
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> updates) {try {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        User updatedUser = userService.updateUser(userDetails.getUsername(), updates);
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", updatedUser.getId());
        profile.put("name", updatedUser.getName());
        profile.put("email", updatedUser.getEmail());
        profile.put("message", "Profile updated successfully");
        return ResponseEntity.ok(profile);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
    }
    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats() {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                    .getAuthentication().getPrincipal();
            Map<String, Object> stats = userService.getUserStats(userDetails.getUsername());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String>
                                                    passwordData) {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                    .getAuthentication().getPrincipal();
            String oldPassword = passwordData.get("oldPassword");
            String newPassword = passwordData.get("newPassword");
            userService.changePassword(userDetails.getUsername(), oldPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }}
    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount() {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                    .getAuthentication().getPrincipal();
            userService.deleteUser(userDetails.getUsername());
            return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
