import { DataTypes } from 'sequelize'

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.sequelize.query(
      `
      DELETE FROM member
      WHERE membershipType = 'external'
    `,
      { transaction }
    )

    await queryInterface.changeColumn(
      'member',
      'membershipType',
      {
        type: DataTypes.ENUM('hobbyist', 'professional'),
        allowNull: false,
      },
      { transaction }
    )

    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

async function down({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.changeColumn(
      'member',
      'membershipType',
      {
        type: DataTypes.ENUM('hobbyist', 'professional', 'external'),
        allowNull: false,
      },
      { transaction }
    )

    // Recover external members from providers table
    await queryInterface.sequelize.query(
      `
      INSERT INTO member (id, providerId, websiteUrl, logoUrl, serviceIpAddress, monitorUrl, membershipType,
        membershipLevelId, membershipLevelTimestamp, status,
        region, latitude, longitude,
        createdAt, updatedAt)
      SELECT (provider.id, provider.id, provider.websiteUrl, provider.logoUrl, '', '', 'external',
        1, FLOOR(UNIX_TIMESTAMP(provider.createdAt)), 'active',
        provider.region, provider.longitude, provider.latitude,
        provider.createdAt, provider.updatedAt)
      FROM provider
        WHERE id IN (
          SELECT provider.id 
          FROM provider LEFT JOIN member
            ON member.id = provider.id AND member.providerId = NULL
        )
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
