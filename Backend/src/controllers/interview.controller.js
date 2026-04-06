const { PDFParse } = require("pdf-parse");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")


/**
 * @description Controller to generate interview report based on user self description,resume and job description
 */

const generateInterviewReportController = async (req, res) => {
    try {
        const pdf = new PDFParse({ data: Uint8Array.from(req.file.buffer) });
        const resumeContent = await pdf.getText();
        const { selfDescription, jobDescription } = req.body;

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent,
            selfDescription,
            jobDescription
        });


        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            title: interviewReportByAi.title,
            matchScore: interviewReportByAi.matchScore,
            technicalQuestions: interviewReportByAi.technicalQuestions,
            behaviouralQuestions: interviewReportByAi.behaviouralQuestions,
            skillGaps: interviewReportByAi.skillGaps,
            preparationPlan: interviewReportByAi.preparationPlan
        })

        res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        })
    } catch (error) {
        console.error("Error generating interview report:", error);
        res.status(500).json({
            message: "Failed to generate interview report",
            error: error.message
        });
    }
}

/**
 * @description Controller to get interview report by interviewId
 */
async function getInterviewReportByIdController(req,res){
    try {
        const {interviewId} = req.params;
        const interviewReport = await interviewReportModel.findOne({_id:interviewId,user:req.user.id});
        if(!interviewReport){
            return res.status(404).json({
                message: "Interview report not found"
            })
        }
        res.status(200).json({
            message: "Interview report fetched successfully",
            interviewReport
        })
    } catch (error) {
        console.error("Error fetching interview report:", error);
        res.status(500).json({
            message: "Failed to fetch interview report",
            error: error.message
        });
    }
}


/**
 * @description Controller to get all interview reports of the current user
 */
async function getAllInterviewReportsController(req,res){
    try {
        const interviewReports = await interviewReportModel.find({user:req.user.id}).sort({createdAt:-1}).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behaviouralQuestions -skillGaps -preparationPlan");
        res.status(200).json({
            message: "Interview reports fetched successfully",
            interviewReports
        })
    } catch (error) {
        console.error("Error fetching interview reports:", error);
        res.status(500).json({
            message: "Failed to fetch interview reports",
            error: error.message
        });
    }
}


/**
 * @description Controller to generate resume pdf
 */
async function generateResumePdfController(req,res){
    const {interviewReportId} = req.params;
    try {
        const interviewReport = await interviewReportModel.findById(interviewReportId);
        if(!interviewReport){
            return res.status(404).json({
                message: "Interview report not found"
            })
        }
        
        const {resume,selfDescription,jobDescription} = interviewReport;
        const pdfBuffer  = await generateResumePdf({resume,selfDescription,jobDescription});
        res.set({"Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume-${interviewReportId}.pdf`
        });
        res.status(200).send(pdfBuffer);
    } catch (error) {
        console.error("Error generating resume pdf:", error);
        res.status(500).json({
            message: "Failed to generate resume pdf",
            error: error.message
        });
    }
}

module.exports = { generateInterviewReportController,getInterviewReportByIdController,getAllInterviewReportsController,generateResumePdfController }