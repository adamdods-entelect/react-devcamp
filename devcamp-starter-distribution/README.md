### What is this repository for? ###

This repo is a single collection of all the services that are required to integrate into in order to complete the Flutter Devcamp. The below instructions will show you how to install the necessary prerequisites as well as give some details on what each of the services do.

## Prerequisites

In order to run these services so that you can interact with them, you will need the following:

### Docker

The services are distributed as a pre-built Docker image and can be run with a single Docker compose file. In order to do that you will need a local installation of Docker or some alternative containerization platform. See the [Docker for Windows](https://holocrons.entelect.co.za/code/local-development/docker-for-windows) holocron for information on alternatives to Docker Desktop.

### Postman

It is not a requirement to have Postman installed, but it would be beneficial as there are a few Postman collections available that could help you understand how to interact with the services. The [Combined DevCamp Service](Combined%20DevCamp%20Service.postman_collection.json) and [DevCamp Client Service](DevCamp%20Client%20Service.postman_collection.json) json files are Postman collections that can be imported into Postman, with an example of how to call each of the services exposed by this application. *Take Note:* This is utilising Postman test and variables to set things like the authorization etc.

## Running the Services

The services can be started in your local Docker host using the accompanying [Docker compose file](compose.yaml).

First, load the pre-built Docker image:

```bash
docker load -i devcamp-product-service.tar
```

Then, start the service and database using docker compose:

Unix shell:
```bash
docker compose up -d
```

Powershell:
```PowerShell
docker compose up -d
```

## Accessing the Services

Once running, you can access the services through:

- **Swagger UI**: http://localhost:8080/swagger-ui/index.html - Interactive API documentation and testing
- **API Base URL**: http://localhost:8080

### Optional: Observability Stack

For advanced monitoring and observability, you can run the services with Grafana, Prometheus, Tempo, and Loki:

```bash
docker compose --profile o11y up -d
```

Access Grafana at http://localhost:3000 (credentials: admin/grafana)

## What services are available

There are a bunch of services exposed and the corresponding OpenAPI specifications are available to correctly document each service:

- [Authorization](specs/auth.yaml)
- [Client API](specs/client.yaml)
- [Customer Information](specs/customer-information.yaml)
- [Department of Home Affairs](specs/dha.yaml)
- [Know Your Customer](specs/kyc.yaml)
- [Product](specs/product.yaml)

### Who do I talk to? ###

* For queries please contact the internal training team or Jesse Leresche
