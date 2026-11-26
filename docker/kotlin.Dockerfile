FROM eclipse-temurin:21-jdk AS build
# The Kotlin compiler comes from JetBrains' GitHub release; the JDK's jar tool unzips it.
ADD https://github.com/JetBrains/kotlin/releases/download/v2.4.21/kotlin-compiler-2.4.21.zip /tmp/kotlin.zip
RUN cd /opt && jar xf /tmp/kotlin.zip && chmod +x kotlinc/bin/*
WORKDIR /src
COPY kotlin/hocuspocus.kt .
RUN /opt/kotlinc/bin/kotlinc hocuspocus.kt -include-runtime -d /hocuspocus.jar

FROM eclipse-temurin:21-jre
COPY --from=build /hocuspocus.jar /app/hocuspocus.jar
ENTRYPOINT ["java", "-jar", "/app/hocuspocus.jar"]
