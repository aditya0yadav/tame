const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('u411184336_acutusaidb', 'u411184336_acutusaidb', 'AcutusaiDb111', {
  host: '193.203.184.105', 
  port: 3306,        
  dialect: 'mysql',
  pool: {
    max: 50,         
    min: 25,         
    acquire: 30000,  
    idle: 10000     
  }
});

module.exports = sequelize;
