SET NOCOUNT ON;
GO

-- Practice and clinic hierarchy
INSERT INTO elm.Practice (PracticeId, PracticeName, TimeZoneName)
VALUES ('11111111-1111-1111-1111-111111111111', 'Demo Dental Practice', 'America/Los_Angeles');
GO

INSERT INTO elm.Clinic (ClinicId, PracticeId, ClinicName, PhoneNumber)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Downtown Demo Clinic', '+1-555-0100');
GO

INSERT INTO elm.Space (SpaceId, ClinicId, SpaceName, SpaceType)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Operatory 1', 'operatory'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Central Sterilization', 'sterilization');
GO

-- Manufacturers, types, and models
INSERT INTO elm.Manufacturer (ManufacturerId, ManufacturerName)
VALUES ('33333333-3333-3333-3333-333333333333', 'A-Dec');
GO

INSERT INTO elm.DeviceType (DeviceTypeId, TypeName)
VALUES
    ('44444444-4444-4444-4444-444444444444', 'Dental Chair'),
    ('55555555-5555-5555-5555-555555555555', 'Instrument Sterilizer');
GO

INSERT INTO elm.DeviceModel (DeviceModelId, ManufacturerId, DeviceTypeId, ModelName, ModelNumber, DefaultWarrantyMonths)
VALUES
    ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Cascade Chair Standard', 'CHAIR-STD', 12),
    ('77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 'Sterilizer Standard', 'STER-STD', 12);
GO

-- Devices
INSERT INTO elm.Device (DeviceId, ClinicId, DeviceModelId, SerialNumber, AssetTag, Status, InstalledOn)
VALUES
    ('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'CHAIR-001', 'DT-CHAIR-01', 'active', '2023-01-02'),
    ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', 'STER-001', 'DT-STER-01', 'active', '2023-03-15');
GO

INSERT INTO elm.DeviceSpaceAssignment (DeviceId, SpaceId, AssignedOn)
VALUES
    ('88888888-8888-8888-8888-888888888888', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2023-01-02'),
    ('99999999-9999-9999-9999-999999999999', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2023-03-15');
GO

-- Service types
INSERT INTO elm.ServiceType (ServiceTypeId, ServiceCode, ServiceName)
VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'PM', 'Preventive Maintenance'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'REP', 'Repair');
GO

-- Provider and certifications
INSERT INTO elm.Provider (ProviderId, PracticeId, ProviderName, Email, PhoneNumber)
VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Alpha Tech Services', 'alpha.tech@example.com', '+1-555-0199');
GO

INSERT INTO elm.ProviderCertification (ProviderCertificationId, ProviderId, ServiceTypeId, DeviceModelId, EffectiveOn, ExpiresOn, Notes)
VALUES ('12345678-90ab-4cde-8123-4567890abcde', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '66666666-6666-6666-6666-666666666666', '2023-01-01', '2030-12-31', 'PM certified for Cascade Chair Standard');
GO

-- Parts catalog (minimal reference)
INSERT INTO elm.Part (PartId, ManufacturerId, PartNumber, PartName)
VALUES ('fedcba98-7654-4321-a987-6543210fedcb', '33333333-3333-3333-3333-333333333333', 'AD-CH-001', 'Hydraulic Hose Kit');
GO

-- Warranty definitions and coverage
INSERT INTO elm.WarrantyDefinition (WarrantyDefId, ManufacturerId, DeviceModelId, WarrantyName, CoverageDescription, TermMonths)
VALUES ('ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'Standard 12 Month Warranty', 'Covers preventive maintenance labor for the first year.', 12);
GO

INSERT INTO elm.WarrantyCoverageServiceType (WarrantyDefId, ServiceTypeId)
VALUES ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'dddddddd-dddd-dddd-dddd-dddddddddddd');
GO

INSERT INTO elm.WarrantyContract (WarrantyContractId, WarrantyDefId, DeviceId, ManufacturerId, RegisteredOn, EffectiveOn, ExpiresOn, Status)
VALUES ('12121212-1212-1212-1212-121212121212', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', '2023-12-15', '2024-01-01', '2030-12-31', 'active');
GO

-- Warranty-backed preventive maintenance event example (valid data)
INSERT INTO elm.ServiceEvent (ServiceEventId, DeviceId, ProviderId, ServiceTypeId, OccurredAt, SpaceId, WarrantyContractId, Notes)
VALUES ('aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee', '88888888-8888-8888-8888-888888888888', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-06-15T10:00:00', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '12121212-1212-1212-1212-121212121212', 'Initial warranty PM visit');
GO

INSERT INTO elm.ServiceEventPart (ServiceEventPartId, ServiceEventId, PartId, Qty, LineCost)
VALUES ('0f0f0f0f-0f0f-0f0f-0f0f-0f0f0f0f0f0f', 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee', 'fedcba98-7654-4321-a987-6543210fedcb', 1, 0.00);
GO

PRINT 'Seed data applied.';
GO
