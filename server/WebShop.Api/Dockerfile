FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY WebShop.sln ./
COPY server/WebShop.Domain/WebShop.Domain.csproj server/WebShop.Domain/
COPY server/WebShop.Application/WebShop.Application.csproj server/WebShop.Application/
COPY server/WebShop.Infrastructure/WebShop.Infrastructure.csproj server/WebShop.Infrastructure/
COPY server/WebShop.Api/WebShop.Api.csproj server/WebShop.Api/
RUN dotnet restore server/WebShop.Api/WebShop.Api.csproj
COPY server/ server/
RUN dotnet publish server/WebShop.Api/WebShop.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "WebShop.Api.dll"]
