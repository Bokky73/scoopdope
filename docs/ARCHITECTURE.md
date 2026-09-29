# System Architecture

This document provides a visual overview of the system architecture, covering the
API layer, blockchain integration, database, and notification subsystems.

## High-Level Overview

```mermaid
flowchart TB
    subgraph Clients
        Web[Web App]
        Mobile[Mobile App]
        ThirdParty[Third-Party Integrations]
    end

    subgraph API["API Layer"]
        REST[REST / HTTP Endpoints]
        Auth[Authentication & Authorization]
        Validation[Request Validation]
    end

    subgraph Services["Core Services"]
        Business[Business Logic]
        Notifications[Notification Service]
    end

    subgraph Blockchain["Blockchain Integration"]
        Web3[Web3 / RPC Client]
        Contracts[Smart Contracts]
        Indexer[Event Indexer]
    end

    subgraph Data["Data Layer"]
        DB[(Database)]
        Cache[(Cache)]
    end

    subgraph External["External Providers"]
        Email[Email Provider]
        Push[Push Provider]
        Webhooks[Webhook Targets]
    end

    Web --> REST
    Mobile --> REST
    ThirdParty --> REST

    REST --> Auth
    REST --> Validation
    Auth --> Business
    Validation --> Business

    Business --> DB
    Business --> Cache
    Business --> Web3
    Business --> Notifications

    Web3 --> Contracts
    Contracts --> Indexer
    Indexer --> DB

    Notifications --> Email
    Notifications --> Push
    Notifications --> Webhooks
```

## Components

### API Layer
- **REST / HTTP Endpoints** — Public entry points for clients and integrations.
- **Authentication & Authorization** — Verifies caller identity and permissions.
- **Request Validation** — Ensures incoming payloads conform to expected schemas.

### Core Services
- **Business Logic** — Orchestrates domain operations and coordinates other subsystems.
- **Notification Service** — Dispatches user-facing and system notifications.

### Blockchain Integration
- **Web3 / RPC Client** — Communicates with blockchain nodes.
- **Smart Contracts** — On-chain logic invoked by the application.
- **Event Indexer** — Listens for on-chain events and persists relevant state.

### Data Layer
- **Database** — Primary persistent store for application and indexed data.
- **Cache** — Speeds up frequently accessed reads.

### External Providers
- **Email / Push / Webhook Targets** — Delivery channels used by the notification service.

## Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Service
    participant DB
    participant Chain as Blockchain
    participant Notify as Notifications

    Client->>API: HTTP Request
    API->>API: Authenticate & Validate
    API->>Service: Invoke business logic
    Service->>DB: Read / Write
    Service->>Chain: Submit / Query transaction
    Chain-->>Service: Confirmation / Event
    Service->>Notify: Emit notification
    Notify-->>Client: Email / Push / Webhook
    Service-->>API: Result
    API-->>Client: HTTP Response
```
