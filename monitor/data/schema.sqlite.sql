
CREATE TABLE sqlite_sequence(name,seq);

CREATE TABLE `monitor` (
  `monitorId` VARCHAR(64) PRIMARY KEY, 
  `name` VARCHAR(64), 
  `multiaddrs` JSON, 
  `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL
);

CREATE TABLE `peer` (
  `peerId` VARCHAR(64) PRIMARY KEY REFERENCES `health_check` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, 
  `serviceUrl` VARCHAR(132) REFERENCES `service` (`serviceUrl`) ON DELETE CASCADE ON UPDATE CASCADE, 
  `name` VARCHAR(64), `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL
);

CREATE TABLE `service` (
  `serviceUrl` VARCHAR(132) PRIMARY KEY REFERENCES `peer` (`peerId`) ON DELETE CASCADE ON UPDATE CASCADE, 
  `name` VARCHAR(64), 
  `chain` VARCHAR(64), 
  `status` VARCHAR(16), 
  `errorCount` INTEGER, 
  `createdAt` DATETIME NOT NULL, 
  `updatedAt` DATETIME NOT NULL
);

CREATE TABLE `health_check` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT, 
  `monitorId` VARCHAR(64), 
  `serviceUrl` VARCHAR(64) REFERENCES `service` (`serviceUrl`) ON DELETE CASCADE ON UPDATE CASCADE, 
  `peerId` VARCHAR(64) REFERENCES `peer` (`peerId`) ON DELETE CASCADE ON UPDATE CASCADE, 
  `source` VARCHAR(10), 
  `level` VARCHAR(10), 
  `record` JSON, 
  `createdAt` DATETIME NOT NULL
);
CREATE TABLE `log` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT, 
  `level` VARCHAR(10), 
  `peerId` VARCHAR(64) REFERENCES `peer` (`peerId`) ON DELETE NO ACTION ON UPDATE CASCADE, 
  `serviceUrl` VARCHAR(64) REFERENCES `service` (`serviceUrl`) ON DELETE NO ACTION ON UPDATE CASCADE, 
  `data` JSON, 
  `createdAt` DATETIME NOT NULL
);

CREATE TABLE `monitor_service` (
  `createdAt` DATETIME NOT NULL, 
  `updatedAt` DATETIME NOT NULL, 
  `serviceUrl` VARCHAR(132) NOT NULL REFERENCES `service` (`serviceUrl`) ON DELETE CASCADE ON UPDATE CASCADE, 
  `monitorId` VARCHAR(64) NOT NULL REFERENCES `monitor` (`monitorId`) ON DELETE CASCADE ON UPDATE CASCADE, 
  PRIMARY KEY (`serviceUrl`, `monitorId`)
);


-- CREATE TABLE "health_checks" (
-- 	"id"	INTEGER,
-- 	"peerId"	VARCHAR(255),
-- 	"serviceId"	VARCHAR(255),
-- 	"record"	JSON,
-- 	"createdAt"	DATETIME NOT NULL,
-- 	PRIMARY KEY("id")
-- );

-- CREATE TABLE "peers" (
-- 	"peerId"	VARCHAR(255) UNIQUE,
-- 	"name"	VARCHAR(255),
-- 	"createdAt"	DATETIME NOT NULL,
-- 	"updatedAt"	DATETIME NOT NULL,
-- 	PRIMARY KEY("peerId")
-- );

-- CREATE TABLE "service" (
-- 	"serviceId"	VARCHAR(255) UNIQUE,
-- 	"url"	VARCHAR(255),
-- 	"name"	VARCHAR(255),
-- 	"chain"	VARCHAR(255),
-- 	"peerId"	VARCHAR(255),
-- 	"status"	JSON,
-- 	"createdAt"	DATETIME NOT NULL,
-- 	"updatedAt"	DATETIME NOT NULL,
-- 	PRIMARY KEY("serviceId")
-- );

-- -- relationship between peer & service
-- create table "peer_service" (
-- 	"peerId"	VARCHAR(50) UNIQUE,
-- 	"serviceId"	VARCHAR(50) UNIQUE,
-- 	"createdAt"	DATETIME NOT NULL,
-- 	"updatedAt"	DATETIME NOT NULL,
--   PRIMARY KEY("peerId", "serviceId")
-- );
