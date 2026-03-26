// model/GraphEdge.java
package com.graphvisualizer.demo.model;
public class GraphEdge {
    private String source;
    private String target;
    private double weight;
    private boolean directed;
    public GraphEdge(String source, String target, double weight, boolean directed) {
        this.source = source;
        this.target = target;
        this.weight = weight;
        this.directed = directed;
    }
    // Getters and Setters
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }
    public double getWeight() { return weight; }
    public void setWeight(double weight) { this.weight = weight; }
    public boolean isDirected() { return directed; }
    public void setDirected(boolean directed) { this.directed = directed; }
}
