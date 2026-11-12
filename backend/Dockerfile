FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /workspace
COPY backend/pom.xml backend/checkstyle.xml ./
RUN mvn -B -q dependency:go-offline
COPY backend/src ./src
RUN mvn -B -q package -DskipTests

FROM eclipse-temurin:25-jre
RUN useradd --system --uid 1001 journal
WORKDIR /app
COPY --from=build /workspace/target/fintrellis-journal-0.1.0.jar app.jar
USER journal
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/app.jar"]
