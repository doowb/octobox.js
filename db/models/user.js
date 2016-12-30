'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    github_id: DataTypes.INTEGER,
    access_token: DataTypes.STRING,
    github_login: DataTypes.STRING,
    last_synced_at: DataTypes.DATE,
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
  return User;
};
