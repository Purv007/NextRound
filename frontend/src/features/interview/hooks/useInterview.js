import { getAllInterviewReports,getInterviewReportById,generateInterviewReport,generateResumePdf } from "../services/interview.api";
import { useContext, useEffect } from "react";
import { InterviewContext } from "../interview.context";


export const useInterview = () => {
    const context = useContext(InterviewContext);
    if(!context){
        throw new Error("useInterview must be used within InterviewProvider");
    }
    const { report, reports, loading, setLoading, setReport, setReports } = context;

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true);
        let response=null;
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile });
            setReport(response.interviewReport);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }

        return response.interviewReport;
    }

    const getReportById = async (interviewId) => {
        setLoading(true);
        let response=null;
        try {
            response = await getInterviewReportById(interviewId);
            setReport(response.interviewReport);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }

        return response.interviewReport;
    }

    const getAllReports = async () => {
        setLoading(true);
        let response=null;
        try {
            response = await getAllInterviewReports();
            setReports(response.interviewReports);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }

        return response.interviewReports;
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true);
        let response=null;
        try {
            response = await generateResumePdf(interviewReportId);
            const url = window.URL.createObjectURL(new Blob([response], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download",`resume_${interviewReportId}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }

        return response.interviewReport;
    }

    useEffect(() => {
        getAllReports();
    }, [])

    return {
        report,
        reports,
        loading,
        generateReport,
        getReportById,
        getAllReports,
        getResumePdf
    }
}