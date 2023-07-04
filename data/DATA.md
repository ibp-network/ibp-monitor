## Notes on data & migrations

### Database

In order to simplify the models and native SQL in migrations, we took the decision to focus on MariaDB

When running the application manually (e.g. via PM2) you need to run this command to create the database:

```bash
node migrate.js
```

When running the application via Docker, the database is created by a temp container using the same script.

### Empty database

An empty database is created by the following migrations:

20230411123340-create-chain.js
20230411123348-insert-chains.js
20230411123355-create-membership-level.js
20230411123404-insert-membership-levels.js
20230411123418-create-service.js
20230411123426-insert-services.js
20230411123643-create-member.js
20230415190244-create-member-service.js
20230415193015-create-member-service-node.js
20230415201100-create-monitor.js
20230415202600-create-health-check.js
20230415204015-create-log.js
20230417152000-create-geodns-pool.js
20230417152010-insert-geodns-pools.js
20230423233600-add-health-check-indices.js
20230526121900-add-bootnode-check-enum.js
20230607111300-add-bridgehub-westend-chain.js
20230607112800-add-polkadot-and-westend-bridgehub-services.js
20230628090000-add-column-monitor-url.js
20230628090100-drop-log-table.js
20230628090200-drop-column-id.js
20230629160000-alter-member-region.js
20230629170000-drop-member-service-node-memberServiceId.js

### Migrations

Please refer to Sequelize migrations for more information on how to create a new migration.
