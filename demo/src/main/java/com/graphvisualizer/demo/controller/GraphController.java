// controller/GraphController.java
package com.graphvisualizer.demo.controller;
import com.graphvisualizer.demo.model.entity.Graph;
import com.graphvisualizer.demo.service.GraphService;
import com.graphvisualizer.demo.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/graphs")
@CrossOrigin(origins = "https://magnificent-art-production.up.railway.app/")
public class GraphController {
    private final GraphService graphService;private final UserService userService;
    public GraphController(GraphService graphService, UserService userService) {
        this.graphService = graphService;
        this.userService = userService;
    }
    private Long getCurrentUserId() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userService.getUserByEmail(userDetails.getUsername()).getId();
    }
    @PostMapping("/save")
    public ResponseEntity<?> saveGraph(@RequestBody Map<String, String> request) {
        try {
            Graph graph = graphService.saveGraph(
                    request.get("name"),
                    request.get("graphData"),
                    getCurrentUserId()
            );
            return ResponseEntity.ok(graph);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @GetMapping("/list")
    public ResponseEntity<List<Graph>> getUserGraphs() {
        List<Graph> graphs = graphService.getUserGraphs(getCurrentUserId());
        return ResponseEntity.ok(graphs);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Graph> getGraph(@PathVariable Long id) {
        Graph graph = graphService.getGraph(id);
        return ResponseEntity.ok(graph);
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateGraph(@PathVariable Long id, @RequestBody
    Map<String, String> request) {
        try {
            Graph graph = graphService.updateGraph(
                    id,
                    request.get("name"),
                    request.get("graphData")
            );return ResponseEntity.ok(graph);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGraph(@PathVariable Long id) {
        try {
            graphService.deleteGraph(id);
            return ResponseEntity.ok(Map.of("message", "Graph deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
