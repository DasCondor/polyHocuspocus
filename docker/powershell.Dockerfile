# Hardened: PowerShell 7.6 LTS on a chiseled Ubuntu base (no shell, no package
# manager), run as a non-root user, with telemetry and update checks off.
FROM alpine:3@sha256:f59abe656b692d901e184be3445e084786602108599d2a51d229c0f5a48c71bf AS build
# The official release, checked against its published SHA-256.
ADD --checksum=sha256:e261cabc91c78a9afe8d1e5f24731ab0d38204735ab2ec94b0af55102652e10d \
    https://github.com/PowerShell/PowerShell/releases/download/v7.6.10/powershell-7.6.10-linux-x64.tar.gz /tmp/pwsh.tar.gz
RUN mkdir /opt/pwsh && tar -xzf /tmp/pwsh.tar.gz -C /opt/pwsh && chmod 0555 /opt/pwsh/pwsh

FROM mcr.microsoft.com/dotnet/runtime-deps:10.0-noble-chiseled-extra@sha256:1c22aec177579fd929b21a7f2cd520f459f33ff588556890a168bc8acffa4fdf
COPY --from=build /opt/pwsh /opt/pwsh
COPY powershell/hocuspocus.ps1 /app/
ENV POWERSHELL_TELEMETRY_OPTOUT=1 POWERSHELL_UPDATECHECK=Off DOTNET_EnableDiagnostics=0
# PowerShell must write its module caches somewhere, so its home is /tmp; with a
# read-only filesystem, mount a small tmpfs there (compose.yaml does).
ENV HOME=/tmp
USER $APP_UID
ENTRYPOINT ["/opt/pwsh/pwsh", "-NoLogo", "-NoProfile", "-File", "/app/hocuspocus.ps1"]
