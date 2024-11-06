const express = require('express');  // Corrected import of express
const cors = require('cors');
const bodyParser = require('body-parser');

const { Model, DataTypes } = require('sequelize');
const sequelize = require('./config'); 

const app = express();  // Instantiate app using express
app.use(cors());
app.use(express.json());


app.use(bodyParser.json({ limit: '10mb' })); // Adjust the size as needed
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

class Survey extends Model {}

Survey.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    survey_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false  // Allow multiple records with same survey_id
    },
    survey_name: DataTypes.STRING,
    account_name: DataTypes.STRING,
    country_language: DataTypes.STRING,
    industry: DataTypes.STRING,
    study_type: DataTypes.STRING,
    bid_length_of_interview: DataTypes.INTEGER,
    bid_incidence: DataTypes.FLOAT,
    collects_pii: DataTypes.BOOLEAN,
    survey_group_ids: DataTypes.JSON,
    is_live: DataTypes.BOOLEAN,
    survey_quota_calc_type: DataTypes.STRING,
    is_only_supplier_in_group: DataTypes.BOOLEAN,
    cpi: DataTypes.FLOAT,
    total_client_entrants: DataTypes.INTEGER,
    total_remaining: DataTypes.INTEGER,
    completion_percentage: DataTypes.FLOAT,
    conversion: DataTypes.FLOAT,
    overall_completes: DataTypes.INTEGER,
    mobile_conversion: DataTypes.FLOAT,
    earnings_per_click: DataTypes.FLOAT,
    length_of_interview: DataTypes.INTEGER,
    termination_length_of_interview: DataTypes.INTEGER,
    respondent_pids: DataTypes.JSON,
    message_reason: DataTypes.STRING
}, {
    sequelize,
    modelName: 'Survey',
    tableName: 'surveys',
    indexes: [
        {
            fields: ['survey_id']
        }
    ]
});

class SurveyQuota extends Model {}

SurveyQuota.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    survey_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'surveys', key: 'survey_id' }
    },
    survey_quota_type: DataTypes.STRING,
    quota_cpi: DataTypes.FLOAT,
    conversion: DataTypes.FLOAT,
    number_of_respondents: DataTypes.INTEGER,
    questions: DataTypes.JSON
}, {
    sequelize,
    modelName: 'SurveyQuota',
    tableName: 'survey_quotas'
});

class SurveyQualification extends Model {}

SurveyQualification.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    survey_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'surveys', key: 'survey_id' }
    },
    logical_operator: DataTypes.STRING,
    precodes: DataTypes.JSON,
    question_id: DataTypes.INTEGER
}, {
    sequelize,
    modelName: 'SurveyQualification',
    tableName: 'survey_qualifications'
});

// Associations
Survey.hasMany(SurveyQuota, { 
    foreignKey: 'survey_id', 
    sourceKey: 'survey_id',  
    as: 'survey_quotas' 
});
SurveyQuota.belongsTo(Survey, { 
    foreignKey: 'survey_id',
    targetKey: 'survey_id'
});

Survey.hasMany(SurveyQualification, { 
    foreignKey: 'survey_id',
    sourceKey: 'survey_id', 
    as: 'survey_qualifications' 
});
SurveyQualification.belongsTo(Survey, { 
    foreignKey: 'survey_id',
    targetKey: 'survey_id' 
});

async function createSurvey(req, res) {
    const value = req.body;
    value.forEach(element => {
        console.log(element)
    
    try {
        const {
            survey_id, survey_name, account_name, country_language, industry, study_type,
            bid_length_of_interview, bid_incidence, collects_pii, survey_group_ids, is_live,
            survey_quota_calc_type, is_only_supplier_in_group, cpi, total_client_entrants,
            total_remaining, completion_percentage, conversion, overall_completes, mobile_conversion,
            earnings_per_click, length_of_interview, termination_length_of_interview, respondent_pids,
            message_reason, survey_quotas, survey_qualifications
        } = req.body;

        const newSurvey = await Survey.create({
            survey_id, survey_name, account_name, country_language, industry, study_type,
            bid_length_of_interview, bid_incidence, collects_pii, survey_group_ids, is_live,
            survey_quota_calc_type, is_only_supplier_in_group, cpi, total_client_entrants,
            total_remaining, completion_percentage, conversion, overall_completes, mobile_conversion,
            earnings_per_click, length_of_interview, termination_length_of_interview, respondent_pids,
            message_reason
        });

        if (survey_quotas) {
            await Promise.all(survey_quotas.map(async (quota) => {
                await SurveyQuota.create({ ...quota, survey_id: newSurvey.survey_id });
            }));
        }

        if (survey_qualifications) {
            await Promise.all(survey_qualifications.map(async (qualification) => {
                await SurveyQualification.create({ ...qualification, survey_id: newSurvey.survey_id });
            }));
        }

        res.status(201).json({ message: 'Survey created successfully', survey: newSurvey });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating survey', error });
    }
    });
}

app.post('/createSurvey', createSurvey);  // Added route to use the createSurvey function

app.listen(3300, () => { 
  console.log("server is running on 3000");
}); // Closed the app.listen function properly

module.exports = { Survey, SurveyQuota, SurveyQualification, createSurvey };
