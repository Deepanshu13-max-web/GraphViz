// service/GraphService.java
package com.graphvisualizer.demo.service;
import com.graphvisualizer.demo.model.entity.Graph;
import com.graphvisualizer.demo.model.entity.User;
import com.graphvisualizer.demo.repository.GraphRepository;
import com.graphvisualizer.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
@Service
public class GraphService {
    private final GraphRepository graphRepository;
    private final UserRepository userRepository;
    public GraphService(GraphRepository graphRepository, UserRepository userRepository) {
        this.graphRepository = graphRepository;
        this.userRepository = userRepository;
    }
    public Graph saveGraph(String name, String graphData, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Graph graph = new Graph(name, graphData, user);
        return graphRepository.save(graph);
    }public List<Graph> getUserGraphs(Long userId) {
        return graphRepository.findByUserId(userId);
    }
    public Graph getGraph(Long graphId) {
        return graphRepository.findById(graphId)
                .orElseThrow(() -> new RuntimeException("Graph not found"));
    }
    public Graph updateGraph(Long graphId, String name, String graphData) {
        Graph graph = getGraph(graphId);
        graph.setName(name);
        graph.setGraphData(graphData);
        graph.setUpdatedAt(LocalDateTime.now());
        return graphRepository.save(graph);
    }
    public void deleteGraph(Long graphId) {
        graphRepository.deleteById(graphId);
    }
}