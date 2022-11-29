
-- monitor nodes
CREATE TABLE `monitor` (
  `monitorId` varchar(64) NOT NULL DEFAULT '',
  `name` varchar(64) DEFAULT NULL,
  `services` text NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`monitorId`)
);

-- peers, providing [poss. loadbalanced] features behind a service url
CREATE TABLE `peer` (
  `peerId` varchar(64) NOT NULL DEFAULT '',
  `serviceUrl` varchar(132) NOT NULL DEFAULT '',
  `name` varchar(64) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`peerId`)
);

-- entry point for monitoring
CREATE TABLE `service` (
  -- `serviceId` varchar(64) NOT NULL DEFAULT '',
  `serviceUrl` varchar(132) NOT NULL DEFAULT '',
  `name` varchar(64) NOT NULL DEFAULT '',
  `chain` varchar(64) NOT NULL DEFAULT '',
  -- `peerId` varchar(64) NOT NULL DEFAULT '',
  `status` text NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`serviceUrl`)
);

-- relationship between peer & service
-- CREATE TABLE `peer_service` (
--   `peerId` varchar(64) NOT NULL,
--   `serviceUrl` varchar(132) NOT NULL DEFAULT '',
--   `createdAt` datetime DEFAULT NULL,
--   `updatedAt` datetime DEFAULT NULL,
--   PRIMARY KEY (`peerId`,`serviceId`)
-- );

-- results of healthCheck script
CREATE TABLE `health_check` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `serviceUrl` varchar(64) DEFAULT NULL,
  `monitorId` varchar(64) DEFAULT NULL,
  `peerId` varchar(64) DEFAULT NULL,
  `level` varchar(10) DEFAULT NULL,
  `source` varchar(10) DEFAULT NULL,
  `record` text,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
);
