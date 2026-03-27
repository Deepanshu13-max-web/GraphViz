# =====================================================
# DOCKERFILE - Root Folder Se Build
# =====================================================

# Stage 1: Build
FROM maven:3.8.4-openjdk-17-slim AS build

WORKDIR /app

# ✅ pom.xml demo folder me hai - sahi path do
COPY demo/pom.xml ./
COPY demo/mvnw ./
COPY demo/.mvn ./.mvn

# Make mvnw executable
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY demo/src ./src

# Build JAR
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM openjdk:17-jdk-slim

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/auth/test || exit 1

# Run application
CMD ["java", "-jar", "app.jar", "--spring.profiles.active=railway"]
