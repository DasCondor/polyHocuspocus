FROM mcr.microsoft.com/powershell:latest
WORKDIR /app
COPY powershell/hocuspocus.ps1 .
ENTRYPOINT ["pwsh", "-NoLogo", "-NoProfile", "-File", "hocuspocus.ps1"]
