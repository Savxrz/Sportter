#Stage 1: Build con Maven y JDK 17,
FROM maven:3.8.6-eclipse-temurin-17 AS build

WORKDIR /app

#Copia el pom y las fuentes,
COPY pom.xml .
COPY src ./src

#Construye el jar sin tests para acelerar,
RUN mvn clean package -DskipTests

#Stage 2: Imagen runtime con JDK ligero,
FROM eclipse-temurin:17-jdk-alpine

#Copia el jar generado en el stage build,
COPY --from=build /app/target/sportter-0.0.1-SNAPSHOT.jar app.jar

#Expone el puerto 8080 (ajustar si usas otro),
EXPOSE 8080

#Ejecuta el jar,
ENTRYPOINT ["java", "-jar", "/app.jar"]