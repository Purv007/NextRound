const mongoose= require("mongoose");


const technicalQuestionSchema=new mongoose.Schema({
    question:{
        type:String,
        required:[true,"Technical question is required"]

    },
    intention:{
        type:String,
        required:[true,"Intention is required"]
    },
    answer:{
        type:String,
        required:[true,"Answer is required"]
    }
},{
    _id:false
})

const behaviouralQuestionSchema=new mongoose.Schema({
    question:{
        type:String,
        required:[true,"Technical question is required"]

    },
    intention:{
        type:String,
        required:[true,"Intention is required"]
    },
    answer:{
        type:String,
        required:[true,"Answer is required"]
    }
},{
    _id:false
})

const skillGapSchema=new mongoose.Schema({
    skill:{
        type:String,
        required:[true,"Skill is required"]
    },
    severity:{
        type:String,
        enum:["low","medium","high"],
        required:[true,"Severity is required"]
    }
},{
    _id:false
})

const preparationPlanSchema=new mongoose.Schema({
    day:{
        type:Number,
        required:[true,"Day is required"]
    },
    focus:{
        type:String,
        required:[true,"Focus is required"]
    },
    tasks:[{
        type: String,
        required:[true,"Tasks are required"]
    }]
})

/**
 * job description schema :String
 * resume text :String
 * Self description :String
 * 
 * matchScore :Number
 * Technical questions :[{question:"",intention:"",answer:""}]
 * Behavioural quesitons : [{question:"",intention:"",answer:""}]
 * Skill gaps : [{skill:"",severity:{
 *  type:String,
 *  enum:["low","medium","high"]
 * },
 *  reason:String
 * }]
 * Preparation plan : [{day:Number,focus:String,tasks:[String]}]
 */
const interviewReportSchema = new mongoose.Schema({
    jobDescription:{
        type:String,
        required:true
    },
    resume:{
        type:String
    },
    selfDescription:{
        type:String
    },
    matchScore:{
        type:Number,
        min:0,
        max:100
    },
    technicalQuestions:[technicalQuestionSchema],
    behaviouralQuestions:[behaviouralQuestionSchema],
    skillGaps:[skillGapSchema],
    preparationPlan:[preparationPlanSchema],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    title:{
        type:String,
        required:[true,"Job Title is required"]
    }
},{
    timestamps:true
})

const interviewReportModel=mongoose.model("InterviewReport",interviewReportSchema);

module.exports = interviewReportModel
