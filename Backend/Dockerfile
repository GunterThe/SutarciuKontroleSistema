# Multi-stage build for .NET 9 API
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Restore
COPY Backend.csproj ./
RUN dotnet restore "Backend.csproj"

# Copy source and publish
COPY . .
RUN dotnet publish "Backend.csproj" -c Release -o /app/out /p:UseAppHost=false

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Run on 8080 inside container
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/out ./
ENTRYPOINT ["dotnet", "Backend.dll"]
