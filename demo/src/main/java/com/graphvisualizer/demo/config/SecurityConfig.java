package com.graphvisualizer.demo.config;
import com.graphvisualizer.demo.security.JwtAuthenticationEntryPoint;
import com.graphvisualizer.demo.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          JwtAuthenticationEntryPoint unauthorizedHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.unauthorizedHandler = unauthorizedHandler;
    }
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
// Enable CORS with configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
// Disable CSRF for stateless APIs
                .csrf(csrf -> csrf.disable())
                // Exception handling
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(unauthorizedHandler)
                )
// Stateless session
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
// Authorize requests
                .authorizeHttpRequests(auth -> auth
// Public endpoints
                                .requestMatchers("/**").permitAll()
                                .requestMatchers("/api/auth/**").permitAll()
                                .requestMatchers("/api/auth/test").permitAll()
                                .requestMatchers("/api/auth/signup").permitAll()
                                .requestMatchers("/api/auth/login").permitAll()
// Static resources
                                .requestMatchers("/", "/index.html", "/login.html", "/signup.html",
                                        "/dashboard.html").permitAll()
                                .requestMatchers("/css/**", "/js/**", "/assets/**", "/static/**").permitAll()
                                // ✅ CONTENT PAGES - Algorithms aur DSA content sabke liye
                                .requestMatchers("/algorithms/**").permitAll()
                                .requestMatchers("/dsa-content/**").permitAll()

                                // ✅ MAIN PAGES - Landing page, login, signup
                                .requestMatchers("/", "/index.html", "/login", "/login.html",
                                        "/signup", "/signup.html").permitAll()

                                // ✅ H2 Console (agar use kar rahe ho)
                                .requestMatchers("/h2-console/**").permitAll()





// All other requests need authentication
                                .anyRequest().authenticated()
                )
// Add JWT filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
// Allowed origins
        configuration.setAllowedOrigins(Arrays.asList(
              "https://*.railway.app",
            "https://*.onrender.com",
            "http://localhost:3000",
            "http://localhost:8080",
            "http://localhost:5500"
        ));// Allowed methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
// Allowed headers
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With"
        ));
// Exposed headers
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization"
        ));
// Allow credentials
        configuration.setAllowCredentials(true);
// Max age
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration
                                                               authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
