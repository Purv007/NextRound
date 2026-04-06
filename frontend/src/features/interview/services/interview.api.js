import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials:true
});


/**
 * @description Service to generate interview report ase on user self-description, resume and job description
 */
export const generateInterviewReport = async ({jobDescription, selfDescription,resumeFile}) => {
    
    const formData=new FormData();
    formData.append("jobDescription",jobDescription);
    formData.append("selfDescription",selfDescription);
    formData.append("resume",resumeFile);
    
    const response = await api.post("/api/interview", formData,{
        headers:{
            "Content-Type": "multipart/form-data",
        }
    });
    return response.data;
};


/**
 * @description Service to get interview report by id
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`);
    return response.data;
};

/**
 * @description Service to get all interview reports
 */
export const getAllInterviewReports = async () => {
    const response = await api.get(`/api/interview`);
    return response.data;
};

/**
 * @description Service to generate resume pdf on the basis of user self-description, resume and job description
 */
export const generateResumePdf = async (interviewReportId) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`,null,{
        responseType:"blob"
    });
    return response.data;
};