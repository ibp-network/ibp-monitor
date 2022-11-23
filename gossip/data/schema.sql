
CREATE TABLE "health_checks" (
	"id"	INTEGER,
	"peerId"	VARCHAR(255),
	"serviceId"	VARCHAR(255),
	"record"	JSON,
	"createdAt"	DATETIME NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE "peers" (
	"peerId"	VARCHAR(255) UNIQUE,
	"name"	VARCHAR(255),
	"createdAt"	DATETIME NOT NULL,
	"updatedAt"	DATETIME NOT NULL,
	PRIMARY KEY("peerId")
);

CREATE TABLE "service" (
	"serviceId"	VARCHAR(255) UNIQUE,
	"url"	VARCHAR(255),
	"name"	VARCHAR(255),
	"chain"	VARCHAR(255),
	"peerId"	VARCHAR(255),
	"status"	JSON,
	"createdAt"	DATETIME NOT NULL,
	"updatedAt"	DATETIME NOT NULL,
	PRIMARY KEY("serviceId")
);