#Usamos imagen base con JDK 17
FROM eclipse-temurin:17-jdk-alpine

#Copiamos el jar al contenedor
COPY target/sportter-0.0.1-SNAPSHOT.jar app.jar

#Exponemos el puerto
EXPOSE 8080

#Ejecutamos el jar
ENTRYPOINT ["java", "-jar", "/app.jar"]