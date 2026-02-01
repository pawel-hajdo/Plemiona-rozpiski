FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/*.jar /app/app.jar

EXPOSE 8443

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
