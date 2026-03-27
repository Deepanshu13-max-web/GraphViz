package com.graphvisualizer.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Home Controller - Handles root endpoints and health checks
 */
@RestController
@CrossOrigin(origins = "*")
public class HomeController {

    @Autowired
    private Environment environment;

    @Autowired(required = false)
    private DataSource dataSource;

    @Value("${spring.application.name:Graph Visualizer}")
    private String appName;

    @Value("${server.port:8080}")
    private String serverPort;

    /**
     * Root endpoint - Welcome message
     * GET /
     */
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to Graph Algorithm Visualizer API");
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        response.put("version", "1.0.0");
        response.put("documentation", "/api/docs");
        response.put("health", "/api/health");
        response.put("test", "/api/auth/test");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint
     * GET /api/health
     */
    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        health.put("appName", appName);
        health.put("port", serverPort);
        
        // Database health check
        health.put("database", checkDatabaseHealth());
        
        // Environment info
        health.put("environment", getActiveProfiles());
        
        return ResponseEntity.ok(health);
    }

    /**
     * Detailed health check
     * GET /api/health/details
     */
    @GetMapping("/api/health/details")
    public ResponseEntity<Map<String, Object>> healthDetails() {
        Map<String, Object> details = new HashMap<>();
        details.put("status", "UP");
        details.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        details.put("appName", appName);
        details.put("port", serverPort);
        
        // Database details
        Map<String, Object> dbDetails = getDatabaseDetails();
        details.put("database", dbDetails);
        
        // Memory info
        details.put("memory", getMemoryInfo());
        
        // System info
        details.put("system", getSystemInfo());
        
        // Active profiles
        details.put("activeProfiles", getActiveProfiles());
        
        return ResponseEntity.ok(details);
    }

    /**
     * Simple ping endpoint
     * GET /api/ping
     */
    @GetMapping("/api/ping")
    public ResponseEntity<Map<String, String>> ping() {
        Map<String, String> response = new HashMap<>();
        response.put("pong", LocalDateTime.now().toString());
        response.put("status", "alive");
        return ResponseEntity.ok(response);
    }

    /**
     * Info endpoint
     * GET /api/info
     */
    @GetMapping("/api/info")
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> info = new HashMap<>();
        info.put("name", "Graph Algorithm Visualizer");
        info.put("version", "1.0.0");
        info.put("description", "Interactive web application to visualize graph algorithms");
        info.put("algorithms", new String[]{
            "BFS (Breadth-First Search)",
            "DFS (Depth-First Search)",
            "Dijkstra's Shortest Path",
            "Prim's Minimum Spanning Tree",
            "Kruskal's Minimum Spanning Tree"
        });
        info.put("technologies", new String[]{
            "Spring Boot 3.1.5",
            "Java 17",
            "MySQL",
            "JWT Authentication",
            "HTML5 Canvas API"
        });
        info.put("repository", "https://github.com/yourusername/graph-visualizer");
        
        return ResponseEntity.ok(info);
    }

    /**
     * Check database health
     */
    private Map<String, Object> checkDatabaseHealth() {
        Map<String, Object> dbHealth = new HashMap<>();
        
        if (dataSource == null) {
            dbHealth.put("status", "DOWN");
            dbHealth.put("message", "DataSource not available");
            return dbHealth;
        }
        
        try (Connection connection = dataSource.getConnection()) {
            dbHealth.put("status", "UP");
            dbHealth.put("url", connection.getMetaData().getURL());
            dbHealth.put("product", connection.getMetaData().getDatabaseProductName());
            dbHealth.put("version", connection.getMetaData().getDatabaseProductVersion());
        } catch (SQLException e) {
            dbHealth.put("status", "DOWN");
            dbHealth.put("error", e.getMessage());
        }
        
        return dbHealth;
    }

    /**
     * Get database details
     */
    private Map<String, Object> getDatabaseDetails() {
        Map<String, Object> dbDetails = new HashMap<>();
        
        if (dataSource == null) {
            dbDetails.put("status", "NOT_CONFIGURED");
            return dbDetails;
        }
        
        try (Connection connection = dataSource.getConnection()) {
            dbDetails.put("status", "CONNECTED");
            dbDetails.put("url", connection.getMetaData().getURL());
            dbDetails.put("product", connection.getMetaData().getDatabaseProductName());
            dbDetails.put("version", connection.getMetaData().getDatabaseProductVersion());
            dbDetails.put("driver", connection.getMetaData().getDriverName());
        } catch (SQLException e) {
            dbDetails.put("status", "ERROR");
            dbDetails.put("error", e.getMessage());
        }
        
        return dbDetails;
    }

    /**
     * Get memory information
     */
    private Map<String, Object> getMemoryInfo() {
        Map<String, Object> memory = new HashMap<>();
        
        Runtime runtime = Runtime.getRuntime();
        
        memory.put("totalMemory", runtime.totalMemory() / (1024 * 1024) + " MB");
        memory.put("freeMemory", runtime.freeMemory() / (1024 * 1024) + " MB");
        memory.put("maxMemory", runtime.maxMemory() / (1024 * 1024) + " MB");
        memory.put("usedMemory", (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024) + " MB");
        
        return memory;
    }

    /**
     * Get system information
     */
    private Map<String, Object> getSystemInfo() {
        Map<String, Object> system = new HashMap<>();
        
        system.put("os", System.getProperty("os.name"));
        system.put("osVersion", System.getProperty("os.version"));
        system.put("javaVersion", System.getProperty("java.version"));
        system.put("javaVendor", System.getProperty("java.vendor"));
        system.put("processors", Runtime.getRuntime().availableProcessors());
        
        return system;
    }

    /**
     * Get active profiles
     */
    private String[] getActiveProfiles() {
        return environment.getActiveProfiles();
    }

    // =====================================================
    // FRONTEND REDIRECTS (If using static files)
    // =====================================================

    /**
     * Redirect to index.html
     * GET /home
     */
    @GetMapping("/home")
    public String homePage() {
        return "forward:/index.html";
    }

    /**
     * Redirect to dashboard
     * GET /app
     */
    @GetMapping("/app")
    public String appPage() {
        return "forward:/dashboard.html";
    }

    /**
     * Redirect to login
     * GET /login-page
     */
    @GetMapping("/login-page")
    public String loginPage() {
        return "forward:/login.html";
    }

    /**
     * Redirect to signup
     * GET /signup-page
     */
    @GetMapping("/signup-page")
    public String signupPage() {
        return "forward:/signup.html";
    }
}
