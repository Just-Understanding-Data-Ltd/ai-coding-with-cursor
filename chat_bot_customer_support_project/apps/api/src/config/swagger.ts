import type { Options } from "swagger-jsdoc";
import swaggerJsdoc from "swagger-jsdoc";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RiseLoop API Documentation",
      version: "1.0.0",
      description: "API documentation for RiseLoop services",
      license: {
        name: "Private",
      },
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Development server",
      },
      {
        url: "https://api.riseloop.ai",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/routes/**/*.ts"],
} as const;

export const swaggerSpec = swaggerJsdoc(options);
