FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files and restore as distinct layers
COPY ["API/API.csproj", "API/"]
COPY ["Shared/NextEvent.Shared.csproj", "Shared/"]
COPY ["Modules/Identity/NextEvent.Modules.Identity.csproj", "Modules/Identity/"]
COPY ["Modules/Organizations/NextEvent.Modules.Organizations.csproj", "Modules/Organizations/"]
COPY ["Modules/Events/NextEvent.Modules.Events.csproj", "Modules/Events/"]
COPY ["Modules/AI/NextEvent.Modules.AI.csproj", "Modules/AI/"]

RUN dotnet restore "API/API.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/API"
RUN dotnet build "API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "API.dll"]
