# =====================================================
# RAILWAY DEPLOYMENT - WORKING DOCKERFILE
# =====================================================

# Build stage
FROM maven:3.8.4-eclipse-temurin-17 AS build

WORKDIR /app

# Copy files from demo folder
COPY demo/pom.xml ./
COPY demo/mvnw ./
COPY demo/.mvn ./.mvn

RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

COPY demo/src ./src
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install curl
RUN apk add --no-cache curl

# Copy JAR
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/auth/test || exit 1

# Run
CMD ["java", "-jar", "app.jar", "--spring.profiles.active=railway"]
