-- in Docker, this file should be place into /docker-entrypoint-initdb.d/schema.sql
-- it will then execute at 1st run 
CREATE DATABASE ibp_monitor;
USE ibp_monitor;
-- not required, the grant will create a user
-- CREATE USER ibp_monitor IDENTIFIED BY 'ibp_monitor';

-- sys and rpc domains
CREATE TABLE `domain` (
  `id` varchar(132) NOT NULL DEFAULT '',
  `level_required` int(2) NOT NULL DEFAULT 0,
  -- `createdAt` datetime DEFAULT NULL,
  -- `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
);

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

-- members
CREATE TABLE `member` (
  `id` varchar(64) NOT NULL DEFAULT '',
  `name` varchar(64) DEFAULT NULL,
  `status` varchar(32) DEFAULT NULL,
  `website` varchar(64) DEFAULT NULL,
  `logo` varchar(254) DEFAULT NULL,
  `membership` varchar(64) DEFAULT NULL,
  `current_level` varchar(64) DEFAULT NULL,
  `level_timestamp` varchar(64) DEFAULT NULL,
  `services_address` varchar(64) DEFAULT NULL,
  `region` varchar(64) DEFAULT NULL,
  `latitude` varchar(64) DEFAULT NULL,
  `longitude` varchar(64) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
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

-- entry point for monitoring direct endpoints
CREATE TABLE `endpoint` (
  `memberId` varchar(32) NOT NULL DEFAULT '',
  `serviceId` varchar(32) NOT NULL,
  `serviceUrl` varchar(132) NOT NULL DEFAULT '',
  `name` varchar(64) NOT NULL DEFAULT '',
  `chain` varchar(64) NOT NULL DEFAULT '',
  `errorCount` int(11) unsigned DEFAULT 0,
  `status` text NOT NULL DEFAULT '',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`memberId`,`serviceId`)
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
  `memberId` VARCHAR(32) NOT NULL DEFAULT '',
  `serviceId` VARCHAR(32) NOT NULL DEFAULT '',
  `serviceUrl` varchar(64) DEFAULT NULL,
  `monitorId` varchar(64) DEFAULT NULL,
  `peerId` varchar(64) DEFAULT NULL,
  `level` varchar(10) DEFAULT NULL,
  `source` varchar(10) DEFAULT NULL,
  `record` text NOT NULL  DEFAULT '{}',
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `service`;
CREATE TABLE `service` (
  `id` varchar(32) NOT NULL DEFAULT '',
  `type` varchar(32) NOT NULL DEFAULT '',
  `name` varchar(32) DEFAULT NULL,
  `endpoint` varchar(64) DEFAULT NULL,
  `level_required` int(2) NOT NULL DEFAULT 0,
  `parachain` tinyint(1) DEFAULT NULL,
  `parentId` varchar(32) DEFAULT NULL,
  `status` varchar(32) NOT NULL DEFAULT '',
  `logo` varchar(256) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
);

INSERT INTO `service` (`id`, `type`, `name`, `endpoint`, `level_required`, `parachain`, `parentId`, `status`, `logo`)
VALUES
	('bridgehub-kusama', 'rpc', 'Bridgehub Kusama', 'bridgehub-kusama', 5, 1, 'kusama', 'active', 'https://parachains.info/images/parachains/1677333455_bridgehub_kusama.svg'),
	('bridgehub-polkadot', 'rpc', 'Bridgehub Polkadot', 'bridgehub-polkadot', 5, 1, 'polkadot', 'planned', 'https://parachains.info/images/parachains/1677333524_bridgehub_new.svg'),
	('bridgehub-westend', 'rpc', 'Bridgehub Westend', 'bridgehub-westend', 5, 1, 'westend', 'planned', NULL),
	('collectives-kusama', 'rpc', 'Collectives Kusama', 'collectives-kusama', 5, 1, 'kusama', 'planned', 'https://parachains.info/images/parachains/1664976722_collectives_logo.png'),
	('collectives-polkadot', 'rpc', 'Collectives Polkadot', 'collectives-polkadot', 5, 1, 'polkadot', 'active', 'https://parachains.info/images/parachains/1664976722_collectives_logo.png'),
	('collectives-westend', 'rpc', 'Collectives Westend', 'collectives-westend', 5, 1, 'westend', 'active', 'https://parachains.info/images/parachains/1664976722_collectives_logo.png'),
	('encointer-kusama', 'rpc', 'Encointer Kusama', 'encointer-kusama', 5, 1, 'kusama', 'active', 'https://parachains.info/images/parachains/1625163231_encointer_logo.png'),
	('encointer-polkadot', 'rpc', 'Encointer Polkadot', 'encointer-polkadot', 5, 1, 'polkadot', 'planned', 'https://parachains.info/images/parachains/1625163231_encointer_logo.png'),
	('encointer-westend', 'rpc', 'Encointer Westend', 'encointer-westend', 5, 1, 'westend', 'planned', 'https://parachains.info/images/parachains/1625163231_encointer_logo.png'),
	('kusama', 'rpc', 'Kusama RPC', 'kusama', 3, 0, NULL, 'active', NULL),
	('polkadot', 'rpc', 'Polkadot RPC', 'polkadot', 3, 0, NULL, 'active', 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxvZ28iIHhtbG5zPSJodH'),
	('statemine', 'rpc', 'Statemine', 'statemine', 5, 1, 'kusama', 'active', 'https://parachains.info/images/parachains/1623939400_statemine_logo.png'),
	('statemint', 'rpc', 'Statemint', 'statemint', 5, 1, 'polkadot', 'active', 'https://parachains.info/images/parachains/1623939400_statemine_logo.png'),
	('westend', 'rpc', 'Westend RPC', 'westend', 3, 0, NULL, 'active', NULL),
	('westmint', 'rpc', 'Westmint RPC', 'westmint', 5, 1, NULL, 'active', NULL);


GRANT ALL PRIVILEGES ON *.* TO 'ibp_monitor'@'%' IDENTIFIED BY 'ibp_monitor';
