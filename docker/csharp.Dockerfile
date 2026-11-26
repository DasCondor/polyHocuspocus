# Hardened: a chiseled .NET runtime (no shell, no package manager), run as a non-root user.
FROM mcr.microsoft.com/dotnet/sdk:11.0@sha256:2794448a07118a6eaf00f29ab5d2bf44928517ce5ff86505a63a69230374f599 AS build
WORKDIR /src
COPY csharp/HocusPocus.csproj csharp/Program.cs ./
RUN dotnet publish -c Release -o /out

FROM mcr.microsoft.com/dotnet/runtime:10.0-noble-chiseled@sha256:d7841dcba3234bd757f835cdaf03de1cae42b301e7f19677cd87a7bbc2064b27
# No debugger or profiler pipes, so it runs on a read-only filesystem.
ENV DOTNET_EnableDiagnostics=0
COPY --from=build /out /app
USER $APP_UID
ENTRYPOINT ["dotnet", "/app/HocusPocus.dll"]
