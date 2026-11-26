FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY csharp/HocusPocus.csproj csharp/Program.cs ./
RUN dotnet publish -c Release -o /out

FROM mcr.microsoft.com/dotnet/runtime:8.0
COPY --from=build /out /app
ENTRYPOINT ["dotnet", "/app/HocusPocus.dll"]
