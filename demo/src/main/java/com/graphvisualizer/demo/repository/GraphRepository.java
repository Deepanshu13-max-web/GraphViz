package com.graphvisualizer.demo.repository;
import com.graphvisualizer.demo.model.entity.Graph;
import com.graphvisualizer.demo.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface GraphRepository extends JpaRepository<Graph, Long> {
    List<Graph> findByUser(User user);
    List<Graph> findByUserId(Long userId);
    @Query("SELECT COUNT(g) FROM Graph g WHERE g.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    @Query("SELECT g FROM Graph g WHERE g.user.id = :userId ORDER BY g.updatedAt DESC")
    List<Graph> findRecentByUserId(@Param("userId") Long userId);
}
