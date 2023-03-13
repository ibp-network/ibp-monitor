-- in Docker, this file should be place into /docker-entrypoint-initdb.d/schema.sql
-- it will then execute at 1st run 
CREATE DATABASE ibp_monitor;
USE ibp_monitor;
-- not required, the grant will create a user
-- CREATE USER ibp_monitor IDENTIFIED BY 'ibp_monitor';

-- monitor nodes
CREATE TABLE `monitor` (
  `monitorId` varchar(64) NOT NULL DEFAULT '',
  `name` varchar(64) DEFAULT NULL,
  `status` varchar(32) DEFAULT NULL,
  `services` text NOT NULL DEFAULT '',
  `multiaddrs` text NOT NULL DEFAULT '',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`monitorId`)
);

-- peers, providing [poss. loadbalanced] features behind a service url
CREATE TABLE `peer` (
  `peerId` varchar(64) NOT NULL DEFAULT '',
  `serviceUrl` varchar(132) NOT NULL DEFAULT '',
  `name` varchar(64) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`peerId`)
);

-- entry point for monitoring
CREATE TABLE `service` (
  -- `serviceId` varchar(64) NOT NULL DEFAULT '',
  `serviceUrl` varchar(132) NOT NULL DEFAULT '',
  `name` varchar(64) NOT NULL DEFAULT '',
  `chain` varchar(64) NOT NULL DEFAULT '',
  -- `peerId` varchar(64) NOT NULL DEFAULT '',
  `errorCount` int(11) unsigned DEFAULT 0,
  `status` text NOT NULL DEFAULT '',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`serviceUrl`)
);

-- relationship between monitor & service
CREATE TABLE `monitor_service` (
  `monitorId` varchar(64) NOT NULL DEFAULT '',
  `serviceUrl` varchar(132) NOT NULL DEFAULT '',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`monitorId`,`serviceUrl`)
);

-- results of healthCheck script
CREATE TABLE `health_check` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `serviceUrl` varchar(64) DEFAULT NULL,
  `monitorId` varchar(64) DEFAULT NULL,
  `peerId` varchar(64) DEFAULT NULL,
  `level` varchar(10) DEFAULT NULL,
  `source` varchar(10) DEFAULT NULL,
  `record` text NOT NULL  DEFAULT '{}',
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
);

GRANT ALL PRIVILEGES ON *.* TO 'ibp_monitor'@'%' IDENTIFIED BY 'ibp_monitor';
