# =====================================================
# RAILWAY OPTIMIZED DOCKERFILE
# =====================================================
FROM maven:3.8.4-openjdk-17-slim AS build

WORKDIR /app

# Copy all files
COPY . .

# Build with skip tests
RUN mvn clean package -DskipTests

# Runtime stage
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy JAR
COPY --from=build /app/target/*.jar app.jar

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

EXPOSE 8080

CMD ["java", "-jar", "app.jar", "--spring.profiles.active=railway"]
