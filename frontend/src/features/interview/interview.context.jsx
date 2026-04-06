import { createContext, useContext, useState } from "react";
import { generateInterviewReport, getInterviewReportById, getAllInterviewReports } from "./services/interview.api";

export const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [reports,setReports] = useState([]);

    return (
        <InterviewContext.Provider
            value={{
                loading,
                report,
                reports,
                setLoading,
                setReport,
                setReports
            }}
        >
            {children}
        </InterviewContext.Provider>
    );
};

export const useInterview = () => {
    return useContext(InterviewContext);
};