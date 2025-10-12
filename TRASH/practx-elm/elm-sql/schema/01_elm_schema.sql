SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'elm')
BEGIN
    EXEC('CREATE SCHEMA elm AUTHORIZATION dbo;');
END;
GO

-- Core reference tables
CREATE TABLE elm.Practice
(
    PracticeId       UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    PracticeName     NVARCHAR(200)    NOT NULL,
    TimeZoneName     NVARCHAR(100)    NULL,
    CreatedUtc       DATETIME2(0)     NOT NULL CONSTRAINT DF_Practice_CreatedUtc DEFAULT SYSUTCDATETIME(),
    ModifiedUtc      DATETIME2(0)     NOT NULL CONSTRAINT DF_Practice_ModifiedUtc DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE elm.Clinic
(
    ClinicId     UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    PracticeId   UNIQUEIDENTIFIER NOT NULL,
    ClinicName   NVARCHAR(200)    NOT NULL,
    PhoneNumber  NVARCHAR(25)     NULL,
    CreatedUtc   DATETIME2(0)     NOT NULL CONSTRAINT DF_Clinic_CreatedUtc DEFAULT SYSUTCDATETIME(),
    ModifiedUtc  DATETIME2(0)     NOT NULL CONSTRAINT DF_Clinic_ModifiedUtc DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Clinic_Practice FOREIGN KEY (PracticeId) REFERENCES elm.Practice(PracticeId)
);
GO

CREATE TABLE elm.Space
(
    SpaceId     UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    ClinicId    UNIQUEIDENTIFIER NOT NULL,
    SpaceName   NVARCHAR(200)    NOT NULL,
    SpaceType   NVARCHAR(50)     NOT NULL,
    CreatedUtc  DATETIME2(0)     NOT NULL CONSTRAINT DF_Space_CreatedUtc DEFAULT SYSUTCDATETIME(),
    ModifiedUtc DATETIME2(0)     NOT NULL CONSTRAINT DF_Space_ModifiedUtc DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Space_Clinic FOREIGN KEY (ClinicId) REFERENCES elm.Clinic(ClinicId)
);
GO

CREATE TABLE elm.Manufacturer
(
    ManufacturerId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    ManufacturerName NVARCHAR(200) NOT NULL,
    CreatedUtc     DATETIME2(0)    NOT NULL CONSTRAINT DF_Manufacturer_CreatedUtc DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE elm.DeviceType
(
    DeviceTypeId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    TypeName     NVARCHAR(200)    NOT NULL,
    CreatedUtc   DATETIME2(0)     NOT NULL CONSTRAINT DF_DeviceType_CreatedUtc DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE elm.DeviceModel
(
    DeviceModelId   UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    ManufacturerId  UNIQUEIDENTIFIER NOT NULL,
    DeviceTypeId    UNIQUEIDENTIFIER NOT NULL,
    ModelName       NVARCHAR(200)    NOT NULL,
    ModelNumber     NVARCHAR(50)     NULL,
    DefaultWarrantyMonths INT        NULL,
    CreatedUtc      DATETIME2(0)     NOT NULL CONSTRAINT DF_DeviceModel_CreatedUtc DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_DeviceModel_Manufacturer FOREIGN KEY (ManufacturerId) REFERENCES elm.Manufacturer(ManufacturerId),
    CONSTRAINT FK_DeviceModel_DeviceType FOREIGN KEY (DeviceTypeId) REFERENCES elm.DeviceType(DeviceTypeId)
);
GO

CREATE TABLE elm.Device
(
    DeviceId        UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    ClinicId        UNIQUEIDENTIFIER NOT NULL,
    DeviceModelId   UNIQUEIDENTIFIER NOT NULL,
    SerialNumber    NVARCHAR(100)    NULL,
    AssetTag        NVARCHAR(50)     NULL,
    Status          NVARCHAR(20)     NOT NULL CONSTRAINT DF_Device_Status DEFAULT 'active',
    InstalledOn     DATE              NULL,
    RetiredOn       DATE              NULL,
    CreatedUtc      DATETIME2(0)      NOT NULL CONSTRAINT DF_Device_CreatedUtc DEFAULT SYSUTCDATETIME(),
    ModifiedUtc     DATETIME2(0)      NOT NULL CONSTRAINT DF_Device_ModifiedUtc DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Device_Clinic FOREIGN KEY (ClinicId) REFERENCES elm.Clinic(ClinicId),
    CONSTRAINT FK_Device_DeviceModel FOREIGN KEY (DeviceModelId) REFERENCES elm.DeviceModel(DeviceModelId),
    CONSTRAINT CK_Device_Status CHECK (Status IN ('active','in_repair','retired')),
    CONSTRAINT CK_Device_RetiredOn CHECK (RetiredOn IS NULL OR (InstalledOn IS NULL OR RetiredOn >= InstalledOn))
);
GO

CREATE TABLE elm.DeviceSpaceAssignment
(
    DeviceSpaceAssignmentId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    DeviceId   UNIQUEIDENTIFIER NOT NULL,
    SpaceId    UNIQUEIDENTIFIER NOT NULL,
    AssignedOn DATE            NOT NULL,
    ReleasedOn DATE            NULL,
    CreatedUtc DATETIME2(0)    NOT NULL CONSTRAINT DF_DeviceSpaceAssignment_CreatedUtc DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_DeviceSpaceAssignment_Device FOREIGN KEY (DeviceId) REFERENCES elm.Device(DeviceId),
    CONSTRAINT FK_DeviceSpaceAssignment_Space FOREIGN KEY (SpaceId) REFERENCES elm.Space(SpaceId),
    CONSTRAINT CK_DeviceSpaceAssignment_Dates CHECK (ReleasedOn IS NULL OR ReleasedOn >= AssignedOn)
);
GO

CREATE TABLE elm.ServiceType
(
    ServiceTypeId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    ServiceCode   NVARCHAR(50)     NULL,
    ServiceName   NVARCHAR(200)    NOT NULL,
    Description   NVARCHAR(400)    NULL,
    CreatedUtc    DATETIME2(0)     NOT NULL CONSTRAINT DF_ServiceType_CreatedUtc DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE elm.Provider
(
    ProviderId   UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    PracticeId   UNIQUEIDENTIFIER NOT NULL,
    ProviderName NVARCHAR(200)    NOT NULL,
    Email        NVARCHAR(320)    NULL,
    PhoneNumber  NVARCHAR(25)     NULL,
    CreatedUtc   DATETIME2(0)     NOT NULL CONSTRAINT DF_Provider_CreatedUtc DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Provider_Practice FOREIGN KEY (PracticeId) REFERENCES elm.Practice(PracticeId)
);
GO

CREATE TABLE elm.ProviderCertification
(
    ProviderCertificationId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    ProviderId      UNIQUEIDENTIFIER NOT NULL,
    ServiceTypeId   UNIQUEIDENTIFIER NOT NULL,
    DeviceTypeId    UNIQUEIDENTIFIER NULL,
    DeviceModelId   UNIQUEIDENTIFIER NULL,
    EffectiveOn     DATE             NOT NULL,
    ExpiresOn       DATE             NULL,
    Notes           NVARCHAR(400)    NULL,
    CreatedUtc      DATETIME2(0)     NOT NULL CONSTRAINT DF_ProviderCertification_CreatedUtc DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ProviderCertification_Provider FOREIGN KEY (ProviderId) REFERENCES elm.Provider(ProviderId),
    CONSTRAINT FK_ProviderCertification_ServiceType FOREIGN KEY (ServiceTypeId) REFERENCES elm.ServiceType(ServiceTypeId),
    CONSTRAINT FK_ProviderCertification_DeviceType FOREIGN KEY (DeviceTypeId) REFERENCES elm.DeviceType(DeviceTypeId),
    CONSTRAINT FK_ProviderCertification_DeviceModel FOREIGN KEY (DeviceModelId) REFERENCES elm.DeviceModel(DeviceModelId),
    CONSTRAINT CK_ProviderCertification_Dates CHECK (ExpiresOn IS NULL OR ExpiresOn >= EffectiveOn)
);
GO

CREATE TABLE elm.Part
(
    PartId       UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    ManufacturerId UNIQUEIDENTIFIER NULL,
    PartNumber   NVARCHAR(100)    NOT NULL,
    PartName     NVARCHAR(200)    NOT NULL,
    CreatedUtc   DATETIME2(0)     NOT NULL CONSTRAINT DF_Part_CreatedUtc DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Part_Manufacturer FOREIGN KEY (ManufacturerId) REFERENCES elm.Manufacturer(ManufacturerId)
);
GO

CREATE TABLE elm.WarrantyDefinition
(
    WarrantyDefId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    ManufacturerId UNIQUEIDENTIFIER NOT NULL,
    DeviceTypeId   UNIQUEIDENTIFIER NULL,
    DeviceModelId  UNIQUEIDENTIFIER NULL,
    WarrantyName   NVARCHAR(200)    NOT NULL,
    CoverageDescription NVARCHAR(400) NULL,
    TermMonths     INT              NOT NULL,
    CreatedUtc     DATETIME2(0)     NOT NULL CONSTRAINT DF_WarrantyDefinition_CreatedUtc DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_WarrantyDefinition_Manufacturer FOREIGN KEY (ManufacturerId) REFERENCES elm.Manufacturer(ManufacturerId),
    CONSTRAINT FK_WarrantyDefinition_DeviceType FOREIGN KEY (DeviceTypeId) REFERENCES elm.DeviceType(DeviceTypeId),
    CONSTRAINT FK_WarrantyDefinition_DeviceModel FOREIGN KEY (DeviceModelId) REFERENCES elm.DeviceModel(DeviceModelId),
    CONSTRAINT CK_WarrantyDefinition_Term CHECK (TermMonths > 0)
);
GO

CREATE TABLE elm.WarrantyCoverageServiceType
(
    WarrantyDefId UNIQUEIDENTIFIER NOT NULL,
    ServiceTypeId UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT PK_WarrantyCoverageServiceType PRIMARY KEY (WarrantyDefId, ServiceTypeId),
    CONSTRAINT FK_WarrantyCoverageServiceType_Def FOREIGN KEY (WarrantyDefId) REFERENCES elm.WarrantyDefinition(WarrantyDefId) ON DELETE CASCADE,
    CONSTRAINT FK_WarrantyCoverageServiceType_Service FOREIGN KEY (ServiceTypeId) REFERENCES elm.ServiceType(ServiceTypeId)
);
GO

CREATE TABLE elm.WarrantyContract
(
    WarrantyContractId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    WarrantyDefId      UNIQUEIDENTIFIER NOT NULL,
    DeviceId           UNIQUEIDENTIFIER NOT NULL,
    ManufacturerId     UNIQUEIDENTIFIER NOT NULL,
    RegisteredOn       DATE             NOT NULL,
    EffectiveOn        DATE             NOT NULL,
    ExpiresOn          DATE             NOT NULL,
    Status             NVARCHAR(20)     NOT NULL,
    CreatedUtc         DATETIME2(0)     NOT NULL CONSTRAINT DF_WarrantyContract_CreatedUtc DEFAULT SYSUTCDATETIME(),
    ModifiedUtc        DATETIME2(0)     NOT NULL CONSTRAINT DF_WarrantyContract_ModifiedUtc DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_WarrantyContract_Def FOREIGN KEY (WarrantyDefId) REFERENCES elm.WarrantyDefinition(WarrantyDefId),
    CONSTRAINT FK_WarrantyContract_Device FOREIGN KEY (DeviceId) REFERENCES elm.Device(DeviceId),
    CONSTRAINT FK_WarrantyContract_Manufacturer FOREIGN KEY (ManufacturerId) REFERENCES elm.Manufacturer(ManufacturerId),
    CONSTRAINT CK_WarrantyContract_Dates CHECK (EffectiveOn <= ExpiresOn AND RegisteredOn <= EffectiveOn),
    CONSTRAINT CK_WarrantyContract_Status CHECK (Status IN ('active','expired','future','cancelled'))
);
GO

CREATE TABLE elm.ServiceEvent
(
    ServiceEventId   UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    DeviceId         UNIQUEIDENTIFIER NOT NULL,
    ProviderId       UNIQUEIDENTIFIER NOT NULL,
    ServiceTypeId    UNIQUEIDENTIFIER NOT NULL,
    OccurredAt       DATETIME2(0)     NOT NULL,
    SpaceId          UNIQUEIDENTIFIER NULL,
    WarrantyContractId UNIQUEIDENTIFIER NULL,
    CreatedUtc       DATETIME2(0)     NOT NULL CONSTRAINT DF_ServiceEvent_CreatedUtc DEFAULT SYSUTCDATETIME(),
    CreatedBy        NVARCHAR(200)    NULL,
    Notes            NVARCHAR(400)    NULL,
    CONSTRAINT FK_ServiceEvent_Device FOREIGN KEY (DeviceId) REFERENCES elm.Device(DeviceId),
    CONSTRAINT FK_ServiceEvent_Provider FOREIGN KEY (ProviderId) REFERENCES elm.Provider(ProviderId),
    CONSTRAINT FK_ServiceEvent_ServiceType FOREIGN KEY (ServiceTypeId) REFERENCES elm.ServiceType(ServiceTypeId),
    CONSTRAINT FK_ServiceEvent_Space FOREIGN KEY (SpaceId) REFERENCES elm.Space(SpaceId),
    CONSTRAINT FK_ServiceEvent_WarrantyContract FOREIGN KEY (WarrantyContractId) REFERENCES elm.WarrantyContract(WarrantyContractId)
);
GO

CREATE TABLE elm.ServiceEventPart
(
    ServiceEventPartId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    ServiceEventId UNIQUEIDENTIFIER NOT NULL,
    PartId         UNIQUEIDENTIFIER NOT NULL,
    Qty            INT              NOT NULL,
    LineCost       DECIMAL(12,2)    NULL,
    CONSTRAINT FK_ServiceEventPart_ServiceEvent FOREIGN KEY (ServiceEventId) REFERENCES elm.ServiceEvent(ServiceEventId) ON DELETE CASCADE,
    CONSTRAINT FK_ServiceEventPart_Part FOREIGN KEY (PartId) REFERENCES elm.Part(PartId),
    CONSTRAINT CK_ServiceEventPart_Qty CHECK (Qty > 0)
);
GO

-- Helpful indexes
CREATE INDEX IX_Device_Clinic_Status ON elm.Device(ClinicId, Status);
GO
CREATE INDEX IX_ServiceEvent_DeviceOccurred ON elm.ServiceEvent(DeviceId, OccurredAt DESC);
GO
CREATE UNIQUE INDEX IX_DeviceSpaceAssignment_Device_Open ON elm.DeviceSpaceAssignment(DeviceId) WHERE ReleasedOn IS NULL;
GO
CREATE INDEX IX_ProviderCertification_Lookup ON elm.ProviderCertification(ProviderId, ServiceTypeId, DeviceModelId, DeviceTypeId, EffectiveOn, ExpiresOn);
GO
CREATE INDEX IX_WarrantyContract_Device ON elm.WarrantyContract(DeviceId, EffectiveOn, ExpiresOn);
GO

-- Function for provider certification validation
CREATE OR ALTER FUNCTION elm.fn_ProviderCertValid
(
    @ProviderId UNIQUEIDENTIFIER,
    @DeviceId UNIQUEIDENTIFIER,
    @ServiceTypeId UNIQUEIDENTIFIER,
    @OccurredAt DATETIME2
)
RETURNS BIT
AS
BEGIN
    DECLARE @Result BIT = 0;
    DECLARE @DeviceModelId UNIQUEIDENTIFIER;
    DECLARE @DeviceTypeId UNIQUEIDENTIFIER;

    SELECT 
        @DeviceModelId = d.DeviceModelId,
        @DeviceTypeId = dm.DeviceTypeId
    FROM elm.Device d
    INNER JOIN elm.DeviceModel dm ON dm.DeviceModelId = d.DeviceModelId
    WHERE d.DeviceId = @DeviceId;

    IF @DeviceModelId IS NULL
        RETURN 0;

    IF EXISTS (
        SELECT 1
        FROM elm.ProviderCertification pc
        WHERE pc.ProviderId = @ProviderId
          AND pc.ServiceTypeId = @ServiceTypeId
          AND (pc.DeviceModelId IS NULL OR pc.DeviceModelId = @DeviceModelId)
          AND (pc.DeviceTypeId IS NULL OR pc.DeviceTypeId = @DeviceTypeId)
          AND pc.EffectiveOn <= CAST(@OccurredAt AS DATE)
          AND (pc.ExpiresOn IS NULL OR pc.ExpiresOn >= CAST(@OccurredAt AS DATE))
    )
    BEGIN
        SET @Result = 1;
    END

    RETURN @Result;
END;
GO

-- View exposing warranty eligibility per device and service type
CREATE OR ALTER VIEW elm.vw_WarrantyEligibility
AS
SELECT
    wc.WarrantyContractId,
    wc.DeviceId,
    wc.WarrantyDefId,
    wc.EffectiveOn,
    wc.ExpiresOn,
    wc.Status,
    CASE 
        WHEN CAST(SYSUTCDATETIME() AS DATE) BETWEEN wc.EffectiveOn AND wc.ExpiresOn AND wc.Status = 'active' THEN 'active'
        WHEN CAST(SYSUTCDATETIME() AS DATE) < wc.EffectiveOn AND wc.Status IN ('active','future') THEN 'future'
        ELSE 'expired'
    END AS EligibilityStatus,
    wcs.ServiceTypeId
FROM elm.WarrantyContract wc
JOIN elm.WarrantyCoverageServiceType wcs ON wcs.WarrantyDefId = wc.WarrantyDefId;
GO

-- Trigger to ensure devices remain within the same clinic as their assigned space
CREATE OR ALTER TRIGGER elm.trg_DeviceSpace_BlockFloating
ON elm.DeviceSpaceAssignment
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        INNER JOIN elm.Device d ON d.DeviceId = i.DeviceId
        INNER JOIN elm.Space s ON s.SpaceId = i.SpaceId
        WHERE d.ClinicId <> s.ClinicId
    )
    BEGIN
        THROW 50001, 'Device and space must belong to the same clinic.', 1;
    END;

    -- Prevent multiple active assignments per device (ReleasedOn IS NULL)
    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE i.ReleasedOn IS NULL
        GROUP BY i.DeviceId
        HAVING COUNT(*) > 1
    )
    BEGIN
        THROW 50002, 'Device cannot be assigned to multiple spaces simultaneously.', 1;
    END;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE i.ReleasedOn IS NULL
          AND EXISTS (
              SELECT 1
              FROM elm.DeviceSpaceAssignment dsa
              WHERE dsa.DeviceId = i.DeviceId
                AND dsa.DeviceSpaceAssignmentId <> i.DeviceSpaceAssignmentId
                AND dsa.ReleasedOn IS NULL
          )
    )
    BEGIN
        THROW 50003, 'Device already has an active space assignment.', 1;
    END;
END;
GO

-- Trigger enforcing service event domain rules
CREATE OR ALTER TRIGGER elm.trg_ServiceEvent_Validate
ON elm.ServiceEvent
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Ensure provider certification is valid
    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE elm.fn_ProviderCertValid(i.ProviderId, i.DeviceId, i.ServiceTypeId, i.OccurredAt) = 0
    )
    BEGIN
        THROW 50011, 'Provider certification is not valid for the requested service.', 1;
    END;

    -- Ensure warranty contract coverage when provided
    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE i.WarrantyContractId IS NOT NULL
          AND NOT EXISTS (
              SELECT 1
              FROM elm.WarrantyContract wc
              INNER JOIN elm.WarrantyCoverageServiceType wcs ON wcs.WarrantyDefId = wc.WarrantyDefId
              WHERE wc.WarrantyContractId = i.WarrantyContractId
                AND wc.DeviceId = i.DeviceId
                AND wc.EffectiveOn <= CAST(i.OccurredAt AS DATE)
                AND wc.ExpiresOn >= CAST(i.OccurredAt AS DATE)
                AND wc.Status = 'active'
                AND wcs.ServiceTypeId = i.ServiceTypeId
          )
    )
    BEGIN
        THROW 50012, 'Service event is not covered by the referenced warranty contract.', 1;
    END;

    -- Ensure optional space matches clinic of device when provided
    IF EXISTS (
        SELECT 1
        FROM inserted i
        INNER JOIN elm.Device d ON d.DeviceId = i.DeviceId
        INNER JOIN elm.Space s ON s.SpaceId = i.SpaceId
        WHERE i.SpaceId IS NOT NULL
          AND d.ClinicId <> s.ClinicId
    )
    BEGIN
        THROW 50013, 'Service event location must belong to the same clinic as the device.', 1;
    END;
END;
GO

