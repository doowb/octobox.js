'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      github_id: {
        type: Sequelize.INTEGER
      },
      repository_id: {
        type: Sequelize.INTEGER
      },
      repository_full_name: {
        type: Sequelize.STRING
      },
      subject_title: {
        type: Sequelize.STRING
      },
      subject_url: {
        type: Sequelize.STRING
      },
      subject_type: {
        type: Sequelize.STRING
      },
      reason: {
        type: Sequelize.STRING
      },
      unread: {
        type: Sequelize.BOOLEAN
      },
      last_read_at: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING
      },
      archived: {
        type: Sequelize.BOOLEAN
      },
      starred: {
        type: Sequelize.BOOLEAN
      },
      repository_owner_name: {
        type: Sequelize.STRING
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Notifications');
  }
};
