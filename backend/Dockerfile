# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar archivos de proyecto y restaurar dependencias
COPY ["GirasolesRes.Domain/GirasolesRes.Domain.csproj", "GirasolesRes.Domain/"]
COPY ["GirasolesRes.Application/GirasolesRes.Application.csproj", "GirasolesRes.Application/"]
COPY ["GirasolesRes.Infrastructure/GirasolesRes.Infrastructure.csproj", "GirasolesRes.Infrastructure/"]
COPY ["GirasolesRes.API/GirasolesRes.API.csproj", "GirasolesRes.API/"]

RUN dotnet restore "GirasolesRes.API/GirasolesRes.API.csproj"

# Copiar el resto del código y compilar la API
COPY . .
WORKDIR "/src/GirasolesRes.API"
RUN dotnet publish "GirasolesRes.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
EXPOSE 5050
ENV ASPNETCORE_URLS=http://+:5050
ENV ASPNETCORE_ENVIRONMENT=Production
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "GirasolesRes.API.dll"]
