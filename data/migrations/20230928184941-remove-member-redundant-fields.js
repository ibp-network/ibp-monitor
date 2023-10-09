import { DataTypes } from 'sequelize'

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.removeColumn('member', 'name', { transaction })
    await queryInterface.removeColumn('member', 'websiteUrl', { transaction })
    await queryInterface.removeColumn('member', 'logoUrl', { transaction })
    await queryInterface.removeColumn('member', 'region', { transaction })
    await queryInterface.removeColumn('member', 'latitude', { transaction })
    await queryInterface.removeColumn('member', 'longitude', { transaction })

    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

async function down({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.addColumn('member', 'name', {
      type: DataTypes.STRING(128),
      allowNull: true,
      after: 'providerId',

      transaction,
    })
    await queryInterface.addColumn('member', 'websiteUrl', {
      type: DataTypes.STRING(256),
      allowNull: true,
      after: 'name',

      transaction,
    })
    await queryInterface.addColumn('member', 'logoUrl', {
      type: DataTypes.STRING(256),
      allowNull: true,
      after: 'websiteUrl',

      transaction,
    })
    await queryInterface.addColumn('member', 'region', {
      type: DataTypes.ENUM(
        '',
        'africa',
        'asia',
        'central_america',
        'europe',
        'middle_east',
        'north_america',
        'oceania'
      ),
      allowNull: true,
      after: 'status',

      transaction,
    })
    await queryInterface.addColumn('member', 'latitude', {
      type: DataTypes.FLOAT,
      allowNull: false,
      after: 'region',

      transaction,
    })
    await queryInterface.addColumn('member', 'longitude', {
      type: DataTypes.FLOAT,
      allowNull: false,
      after: 'latitude',

      transaction,
    })

    // Copy information back to members from providers table
    await queryInterface.sequelize.query(
      `
      UPDATE member m
      INNER JOIN provider p
        ON m.providerId = p.id
      SET 
        name = provider.name,
        websiteUrl = provider.websiteUrl,
        logoUrl = provider.logoUrl,
        region = provider.region,
        longitude = provider.longitude,
        latitude = provider.latitude,
    `,
      { transaction }
    )

    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

export { up, down }
