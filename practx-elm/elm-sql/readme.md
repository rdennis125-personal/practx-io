Ports & URLs

API dev URL: http://localhost:5080

UX dev URL: http://localhost:5173

CORS: allow http://localhost:5173

Static Test GUIDs (used across seeds, API examples, and UX mocks)

PRACTICE_ID = 11111111-1111-1111-1111-111111111111
CLINIC_ID   = 22222222-2222-2222-2222-222222222222

MFR_A_DEC_ID       = 33333333-3333-3333-3333-333333333333
DTYPE_CHAIR_ID     = 44444444-4444-4444-4444-444444444444
DTYPE_INSTR_ID     = 55555555-5555-5555-5555-555555555555

DMODEL_CHAIR_STD   = 66666666-6666-6666-6666-666666666666
DMODEL_INSTR_STD   = 77777777-7777-7777-7777-777777777777

DEVICE_CHAIR_01    = 88888888-8888-8888-8888-888888888888
DEVICE_INSTR_01    = 99999999-9999-9999-9999-999999999999

SPACE_OP1_ID       = aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
SPACE_STERIL_ID    = bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb

PROVIDER_ALPHA_ID  = cccccccc-cccc-cccc-cccc-cccccccccccc
SERVTYPE_PM_ID     = dddddddd-dddd-dddd-dddd-dddddddddddd
SERVTYPE_REPAIR_ID = eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee

WDEF_12MO_STD_ID   = ffffffff-ffff-ffff-ffff-ffffffffffff
WCONTRACT_CHAIR_01 = 12121212-1212-1212-1212-121212121212


OpenAPI v1 (authoritative; both API & UX must conform)

openapi: 3.0.3
info:
  title: Practx ELM API
  version: 1.0.0
servers:
  - url: http://localhost:5080
paths:
  /clinics/{clinicId}/devices:
    get:
      summary: List devices for a clinic
      parameters:
        - name: clinicId
          in: path
          required: true
          schema: { type: string, format: uuid }
        - name: typeId
          in: query
          schema: { type: string, format: uuid, nullable: true }
        - name: status
          in: query
          schema: { type: string, enum: [active, in_repair, retired], nullable: true }
        - name: search
          in: query
          schema: { type: string, nullable: true, description: "serial substring" }
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items: { $ref: '#/components/schemas/DeviceListItem' }
  /devices/{deviceId}:
    get:
      summary: Get device detail
      parameters:
        - name: deviceId
          in: path
          required: true
          schema: { type: string, format: uuid }
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema: { $ref: '#/components/schemas/DeviceDetail' }
  /devices/{deviceId}/warranty/active:
    get:
      summary: Get active warranty on a date
      parameters:
        - name: deviceId
          in: path
          required: true
          schema: { type: string, format: uuid }
        - name: on
          in: query
          required: true
          schema: { type: string, format: date }
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema: { $ref: '#/components/schemas/WarrantyActive' }
  /warranties/contracts:
    post:
      summary: Register a warranty contract for a device
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/WarrantyContractCreate' }
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema: { $ref: '#/components/schemas/WarrantyContract' }
        '400':
          description: Validation error
  /service-events:
    post:
      summary: Create a service event with domain validations
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/ServiceEventCreate' }
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema: { $ref: '#/components/schemas/ServiceEvent' }
        '400':
          description: Validation error
  /lookups/service-types:
    get:
      responses:
        '200': { description: OK, content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/Lookup' }}}}}
  /lookups/device-types:
    get:
      responses:
        '200': { description: OK, content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/Lookup' }}}}}
  /lookups/providers:
    get:
      responses:
        '200': { description: OK, content: { application/json: { schema: { type: array, items: { $ref: '#/components/schemas/Lookup' }}}}}
components:
  schemas:
    Lookup:
      type: object
      properties: { id: {type: string, format: uuid}, name: {type: string} }
      required: [id, name]
    DeviceListItem:
      type: object
      properties:
        deviceId: { type: string, format: uuid }
        deviceTypeId: { type: string, format: uuid }
        deviceTypeName: { type: string }
        deviceModelId: { type: string, format: uuid }
        deviceModelName: { type: string }
        status: { type: string, enum: [active, in_repair, retired] }
        installedAt: { type: string, format: date-time, nullable: true }
        serialNumber: { type: string, nullable: true }
        warrantyBadge: { type: string, enum: [active, expired, none] }
      required: [deviceId, deviceTypeId, deviceTypeName, deviceModelId, deviceModelName, status, warrantyBadge]
    DeviceDetail:
      allOf:
        - $ref: '#/components/schemas/DeviceListItem'
        - type: object
          properties:
            notes: { type: string, nullable: true }
            spaces: 
              type: array
              items: { type: object, properties: { spaceId: {type: string, format: uuid}, name: {type: string}, kind: {type: string} }, required: [spaceId, name, kind] }
            serviceEvents:
              type: array
              items: { $ref: '#/components/schemas/ServiceEvent' }
    WarrantyActive:
      type: object
      properties:
        warrantyContractId: { type: string, format: uuid, nullable: true }
        warrantyDefId: { type: string, format: uuid, nullable: true }
        name: { type: string, nullable: true }
        effectiveOn: { type: string, format: date, nullable: true }
        expiresOn: { type: string, format: date, nullable: true }
        coveredServiceTypeIds: { type: array, items: { type: string, format: uuid } }
        status: { type: string, enum: [active, expired, none] }
      required: [status, coveredServiceTypeIds]
    WarrantyContractCreate:
      type: object
      properties:
        deviceId: { type: string, format: uuid }
        manufacturerId: { type: string, format: uuid }
        warrantyDefId: { type: string, format: uuid }
        registeredOn: { type: string, format: date }
      required: [deviceId, manufacturerId, warrantyDefId, registeredOn]
    WarrantyContract:
      type: object
      properties:
        warrantyContractId: { type: string, format: uuid }
        deviceId: { type: string, format: uuid }
        manufacturerId: { type: string, format: uuid }
        warrantyDefId: { type: string, format: uuid }
        effectiveOn: { type: string, format: date }
        expiresOn: { type: string, format: date }
        status: { type: string }
      required: [warrantyContractId, deviceId, manufacturerId, warrantyDefId, effectiveOn, expiresOn, status]
    ServiceEventCreate:
      type: object
      properties:
        deviceId: { type: string, format: uuid }
        providerId: { type: string, format: uuid }
        serviceTypeId: { type: string, format: uuid }
        occurredAt: { type: string, format: date-time }
        spaceId: { type: string, format: uuid, nullable: true }
        warrantyContractId: { type: string, format: uuid, nullable: true }
        parts:
          type: array
          items: { type: object, properties: { partId: {type: string, format: uuid}, qty: {type: integer, minimum: 1}, lineCost: {type: number} }, required: [partId, qty] }
      required: [deviceId, providerId, serviceTypeId, occurredAt]
    ServiceEvent:
      type: object
      properties:
        eventId: { type: string, format: uuid }
        deviceId: { type: string, format: uuid }
        providerId: { type: string, format: uuid }
        serviceTypeId: { type: string, format: uuid }
        occurredAt: { type: string, format: date-time }
        warrantyContractId: { type: string, format: uuid, nullable: true }
      required: [eventId, deviceId, providerId, serviceTypeId, occurredAt]

    You are the database lead. Produce schema + seed that align to OpenAPI and the fixed GUIDs.

File Tree
elm-sql/
  schema/
    01_elm_schema.sql
    02_seed_minimal.sql
  scripts/
    create_local.sqlcmd.ps1
  bicep/
    sql.bicep              # optional
  ef/
    ElmDbContext.cs        # optional
    Migrations/            # optional

Requirements

Implement schema previously specified (all tables + FKs) under schema elm.

Include:

Trigger elm.trg_DeviceSpace_BlockFloating

View elm.vw_WarrantyEligibility

Function elm.fn_ProviderCertValid

Trigger elm.trg_ServiceEvent_Validate

Helpful indexes (as provided earlier)

Use the exact fixed GUIDs in 02_seed_minimal.sql to match UX/API:

Practice/Clinic/Spaces (PRACTICE_ID, CLINIC_ID, SPACE_OP1_ID, SPACE_STERIL_ID)

Manufacturer, DeviceTypes, Models

Devices: DEVICE_CHAIR_01, DEVICE_INSTR_01

ServiceTypes: SERVTYPE_PM_ID, SERVTYPE_REPAIR_ID

Provider + Certifications for PM on the chair model/type

WarrantyDefinition WDEF_12MO_STD_ID covering PM; WarrantyContract WCONTRACT_CHAIR_01

Ensure that:

GET /clinics/{clinicId}/devices can join and return: type/model names, serial (nullable), and compute warranty badge (derive in API or expose a helper view).

A PM service event on DEVICE_CHAIR_01 with WCONTRACT_CHAIR_01 on a valid date passes.

A PM event with an expired cert or non-covered type fails with trigger message.

Commands

scripts/create_local.sqlcmd.ps1 should:

Create DB practx_elm

Execute schema/01_elm_schema.sql

Execute schema/02_seed_minimal.sql

Acceptance

DB builds clean; seeds create rows with the exact GUIDs.

Selecting elm.vw_WarrantyEligibility shows coverage for the seeded contract.

Invalid ServiceEvent inserts fail as designed.
