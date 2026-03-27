package com.graphvisualizer.demo.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("https://magnificent-art-production.up.railway.app/")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
    }
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/index.html");
        registry.addViewController("/login").setViewName("forward:/login.html");
        registry.addViewController("/signup").setViewName("forward:/signup.html");
        registry.addViewController("/dashboard").setViewName("forward:/dashboard.html");
        registry.addViewController("/algorithms/bfs").setViewName("forward:/algorithms/bfs.html");
        registry.addViewController("/algorithms/dfs").setViewName("forward:/algorithms/dfs.html");
        registry.addViewController("/algorithms/dijkstra").setViewName("forward:/algorithms/dijkstra.html");
        registry.addViewController("/algorithms/prims").setViewName("forward:/algorithms/prims.html");
        registry.addViewController("/algorithms/kruskal").setViewName("forward:/algorithms/kruskal.html");

        // DSA content pages
        registry.addViewController("/dsa-content/graph-basics").setViewName("forward:/dsa-content/graph-basics.html");
        registry.addViewController("/dsa-content/graph-types").setViewName("forward:/dsa-content/graph-types.html");
        registry.addViewController("/dsa-content/graph-representation").setViewName("forward:/dsa-content/graph-representation.html");
        registry.addViewController("/dsa-content/complexity-analysis").setViewName("forward:/dsa-content/complexity-analysis.html");
        registry.addViewController("/dsa-content/real-life-applications").setViewName("forward:/dsa-content/real-life-applications.html");

    }

}
