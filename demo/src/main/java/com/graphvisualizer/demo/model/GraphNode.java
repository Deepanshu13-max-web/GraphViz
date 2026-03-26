// model/GraphNode.java (for graph representation)
package com.graphvisualizer.demo.model;
public class GraphNode {
    private String id;
    private double x;
    private double y;
    private String label;
    public GraphNode(String id, double x, double y, String label) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.label = label;
    }
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public double getX() { return x; }
    public void setX(double x) { this.x = x; }
    public double getY() { return y; }
    public void setY(double y) { this.y = y; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }}
