# Hardened: a distroless Java runtime (no shell, no package manager), run as a non-root user.
FROM eclipse-temurin:25-jdk@sha256:ce2ef9d2d67a68de5e196d4de9d743327c44a10b57fe02ec39f572c652cacfd3 AS build
# The Kotlin compiler from the JetBrains GitHub release, checked against its published SHA-256.
ADD --checksum=sha256:7cc140e76daf416a0424a5557f99afd7ca89ebd463ea1101261e3e01c33e75cd \
    https://github.com/JetBrains/kotlin/releases/download/v2.4.21/kotlin-compiler-2.4.21.zip /tmp/kotlin.zip
WORKDIR /opt
RUN jar xf /tmp/kotlin.zip && chmod +x kotlinc/bin/*
WORKDIR /src
COPY kotlin/hocuspocus.kt .
RUN /opt/kotlinc/bin/kotlinc hocuspocus.kt -include-runtime -d /hocuspocus.jar

FROM gcr.io/distroless/java21-debian13:nonroot@sha256:128bd878463537eef7771b50fecf68faace9089f654a2d233f1c4f344e6817d9
COPY --from=build /hocuspocus.jar /app/hocuspocus.jar
USER 65532:65532
# -XX:-UsePerfData writes nothing to /tmp, so it runs on a read-only filesystem.
ENTRYPOINT ["/usr/bin/java", "-XX:-UsePerfData", "-jar", "/app/hocuspocus.jar"]
