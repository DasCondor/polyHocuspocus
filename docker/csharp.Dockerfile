# Hardened: a chiseled .NET runtime (no shell, no package manager), run as a non-root user.
FROM mcr.microsoft.com/dotnet/sdk:8.0@sha256:1b955f179b02df4f0eb5fadedaa898cbe44d620a64aab52eec72c8e91d1355b5 AS build
WORKDIR /src
COPY csharp/HocusPocus.csproj csharp/Program.cs ./
RUN dotnet publish -c Release -o /out

FROM mcr.microsoft.com/dotnet/runtime:8.0-noble-chiseled@sha256:c7efd3e876d9e1aa114b8fd633e560a099d0d8e2701ba3b091b782334c6b38da
# No debugger or profiler pipes, so it runs on a read-only filesystem.
ENV DOTNET_EnableDiagnostics=0
COPY --from=build /out /app
USER $APP_UID
ENTRYPOINT ["dotnet", "/app/HocusPocus.dll"]
