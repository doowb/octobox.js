'use strict';
module.exports = function(sequelize, DataTypes) {
  var Notifications = sequelize.define('Notifications', {
    user_id: DataTypes.INTEGER,
    github_id: DataTypes.INTEGER,
    repository_id: DataTypes.INTEGER,
    repository_full_name: DataTypes.STRING,
    subject_title: DataTypes.STRING,
    subject_url: DataTypes.STRING,
    subject_type: DataTypes.STRING,
    reason: DataTypes.STRING,
    unread: DataTypes.BOOLEAN,
    last_read_at: DataTypes.STRING,
    url: DataTypes.STRING,
    archived: DataTypes.BOOLEAN,
    starred: DataTypes.BOOLEAN,
    repository_owner_name: DataTypes.STRING,
    updated_at: DataTypes.DATE,
    created_at: DataTypes.DATE
  }, {
    underscored: true,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Notifications;
};
