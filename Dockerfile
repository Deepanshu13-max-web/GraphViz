FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build/app/target/*.jar app.jar
ENV JAVA_HOME=/usr/local/openjdk-17
ENV PATH=$JAVA_HOME/bin:$PATH
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
