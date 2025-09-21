create table ORG (
  ORG_ID uniqueidentifier not null default newid() primary key,
  NAME nvarchar(200) not null,
  PLAN nvarchar(50) not null default 'free',
  STATUS nvarchar(50) not null default 'active',
  CREATED_AT datetime2 not null default sysutcdatetime()
);

create table [USER] (
  USER_ID uniqueidentifier not null default newid() primary key,
  ORG_ID uniqueidentifier not null references ORG(ORG_ID),
  EMAIL nvarchar(320) not null,
  DISPLAY_NAME nvarchar(200) null,
  STATUS nvarchar(50) not null default 'active',
  UNIQUE (ORG_ID, EMAIL)
);

create table ROLE (
  USER_ID uniqueidentifier not null references [USER](USER_ID),
  ORG_ID uniqueidentifier not null references ORG(ORG_ID),
  ROLE nvarchar(50) not null,
  primary key (USER_ID, ROLE)
);

create table SUBSCRIPTION (
  ORG_ID uniqueidentifier not null primary key references ORG(ORG_ID),
  STRIPE_CUSTOMER_ID nvarchar(64) null,
  STRIPE_SUBSCRIPTION_ID nvarchar(64) null,
  PRODUCT nvarchar(100) null,
  PRICE_ID nvarchar(100) null,
  STATUS nvarchar(50) not null default 'none',
  RENEWS_AT datetime2 null,
  UPDATED_AT datetime2 not null default sysutcdatetime()
);

create table ENTITLEMENT (
  ORG_ID uniqueidentifier not null primary key references ORG(ORG_ID),
  ELM bit not null default 0,
  UPDATED_AT datetime2 not null default sysutcdatetime()
);

create table SUBSCRIPTION_EVENTS (
  EVENT_ID nvarchar(255) not null primary key,
  EVENT_TYPE nvarchar(100) not null,
  ORG_ID uniqueidentifier null,
  PAYLOAD_JSON nvarchar(max) not null,
  CREATED_AT datetime2 not null default sysutcdatetime()
);

create table DEALER (
  DEALER_ID uniqueidentifier not null default newid() primary key,
  NAME nvarchar(200) not null,
  REGION nvarchar(100) null
);

create table DEVICE (
  DEVICE_ID uniqueidentifier not null default newid() primary key,
  ORG_ID uniqueidentifier not null references ORG(ORG_ID),
  OEM nvarchar(120) not null,
  MODEL nvarchar(120) not null,
  SERIAL nvarchar(120) not null,
  INSTALL_DATE date null,
  LOCATION nvarchar(200) null,
  STATUS nvarchar(60) not null default 'active',
  UNIQUE (ORG_ID, SERIAL)
);

create table TPM_CONTRACT (
  CONTRACT_ID uniqueidentifier not null default newid() primary key,
  ORG_ID uniqueidentifier not null references ORG(ORG_ID),
  DEVICE_ID uniqueidentifier not null references DEVICE(DEVICE_ID),
  DEALER_ID uniqueidentifier null references DEALER(DEALER_ID),
  TERM_MONTHS int not null,
  STATUS nvarchar(50) not null default 'pending'
);

create table [ORDER] (
  ORDER_ID uniqueidentifier not null default newid() primary key,
  ORG_ID uniqueidentifier not null references ORG(ORG_ID),
  TYPE nvarchar(20) not null check (TYPE in ('TPM','PARTS')),
  DEALER_ID uniqueidentifier null references DEALER(DEALER_ID),
  OEM nvarchar(120) null,
  TOTAL_MSRP decimal(18,2) not null default 0,
  STATUS nvarchar(50) not null default 'received',
  CREATED_AT datetime2 not null default sysutcdatetime()
);
