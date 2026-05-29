# ADR-002: Use NestJS over Express

## Status

Accepted

## Context

We needed to select a Node.js backend framework for building a scalable REST API that handles authentication, course management, database operations, and blockchain interactions.

Key requirements:
- TypeScript-first development
- Built-in dependency injection
- Structured architecture for team collaboration
- Easy integration with PostgreSQL, Redis, JWT, and Swagger
- Testability with mocking and DI
- Scalability for future microservices

## Decision

We chose NestJS as our backend framework instead of raw Express.

## Rationale

**Architecture & Structure:**
- NestJS: Opinionated architecture with modules, controllers, services, and providers
- Express: Minimal, requires manual structure decisions
- For a team project with multiple developers, NestJS's conventions reduce bikeshedding and improve code consistency

**TypeScript Support:**
- NestJS: Built with TypeScript from the ground up, first-class decorators
- Express: TypeScript support is an afterthought, requires manual type definitions
- Decorators (@Controller, @Injectable, @UseGuards) provide clean, declarative code

**Dependency Injection:**
- NestJS: Built-in DI container with automatic resolution
- Express: Manual dependency management or third-party libraries
- DI simplifies testing, reduces coupling, and improves maintainability

**Built-in Features:**
- NestJS includes: validation pipes, guards, interceptors, exception filters, Swagger integration
- Express: Requires manual integration of each feature
- Reduces boilerplate and ensures consistent patterns

**Database Integration:**
- NestJS: First-class TypeORM integration with @nestjs/typeorm
- Express: Manual setup and configuration
- Repository pattern and entity decorators work seamlessly

**API Documentation:**
- NestJS: Swagger/OpenAPI auto-generation via @nestjs/swagger decorators
- Express: Manual swagger-jsdoc setup or separate spec files
- Decorators on DTOs automatically generate accurate API docs

**Testing:**
- NestJS: Built-in testing utilities with dependency injection mocking
- Express: Manual test setup with supertest
- TestingModule makes unit and integration tests straightforward

**Scalability:**
- NestJS: Designed for microservices with @nestjs/microservices
- Express: Requires custom architecture for service decomposition
- Future-proofs the platform for potential service splitting

## Consequences

**Positive:**
- Consistent, maintainable codebase with clear separation of concerns
- Reduced boilerplate through decorators and built-in features
- Excellent TypeScript experience with type safety throughout
- Easy onboarding for new developers familiar with Angular-like patterns
- Comprehensive testing utilities out of the box
- Swagger docs stay in sync with code automatically

**Negative:**
- Steeper learning curve for developers unfamiliar with DI and decorators
- More opinionated than Express (less flexibility for unconventional patterns)
- Slightly larger bundle size and memory footprint
- Decorator-heavy code may feel verbose for simple endpoints
- Framework lock-in (harder to migrate away than Express)

**Neutral:**
- Requires understanding NestJS-specific concepts (modules, providers, lifecycle)
- Performance is comparable to Express for most use cases
- Community is smaller than Express but growing rapidly

## References

- [NestJS Documentation](https://docs.nestjs.com)
- [Express Documentation](https://expressjs.com)
- [TypeORM with NestJS](https://docs.nestjs.com/techniques/database)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
