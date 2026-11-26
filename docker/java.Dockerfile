FROM eclipse-temurin:21-jdk AS build
WORKDIR /src
COPY java/HocusPocus.java .
RUN javac -d /out HocusPocus.java

FROM eclipse-temurin:21-jre
COPY --from=build /out /app
ENTRYPOINT ["java", "-cp", "/app", "HocusPocus"]
