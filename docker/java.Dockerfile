# Hardened: a distroless Java runtime (no shell, no package manager), run as a non-root user.
FROM eclipse-temurin:25-jdk@sha256:ce2ef9d2d67a68de5e196d4de9d743327c44a10b57fe02ec39f572c652cacfd3 AS build
WORKDIR /src
COPY java/HocusPocus.java .
RUN javac -d /out HocusPocus.java

FROM gcr.io/distroless/java21-debian13:nonroot@sha256:128bd878463537eef7771b50fecf68faace9089f654a2d233f1c4f344e6817d9
COPY --from=build /out /app
USER 65532:65532
# -XX:-UsePerfData writes nothing to /tmp, so it runs on a read-only filesystem.
ENTRYPOINT ["/usr/bin/java", "-XX:-UsePerfData", "-cp", "/app", "HocusPocus"]
