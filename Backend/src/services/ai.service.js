const { GoogleGenAI, Type } = require("@google/genai")
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const interviewReportSchema = {
    type: Type.OBJECT,
    properties: {
        matchScore: {
            type: Type.NUMBER,
            description: "A score between 0 and 100 indicating how well the candidate's profile matches the job description"
        },
        technicalQuestions: {
            type: Type.ARRAY,
            description: "Technical questions that can be asked in the interview along with their intention and how to answer them",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "Technical question that can be asked in the interview" },
                    intention: { type: Type.STRING, description: "The intention of the interviewer behind asking this question" },
                    answer: { type: Type.STRING, description: "How to answer this question, what points to cover, what approach to take etc." }
                },
                required: ["question", "intention", "answer"]
            }
        },
        behaviouralQuestions: {
            type: Type.ARRAY,
            description: "Behavioural questions that can be asked in the interview along with their intention and how to answer them",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "Behavioural question that can be asked in the interview" },
                    intention: { type: Type.STRING, description: "The intention of the interviewer behind asking this question" },
                    answer: { type: Type.STRING, description: "How to answer this question, what points to cover, what approach to take etc." }
                },
                required: ["question", "intention", "answer"]
            }
        },
        skillGaps: {
            type: Type.ARRAY,
            description: "List of skill gaps in the candidate's profile along with their severity",
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: { type: Type.STRING, description: "Skill which the candidate is lacking" },
                    severity: { type: Type.STRING, enum: ["low", "medium", "high"], description: "The severity of this skill gap" }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: Type.ARRAY,
            description: "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.NUMBER, description: "The day number in the preparation plan, starting from 1" },
                    focus: { type: Type.STRING, description: "The main focus of this day, e.g. data structures, system design, mock interviews, etc." },
                    tasks: {
                        type: Type.ARRAY,
                        description: "List of tasks to be done on this day",
                        items: { type: Type.STRING }
                    }
                },
                required: ["day", "focus", "tasks"]
            }
        },
        title: {
            type: Type.STRING,
            description: "The Title of the job for which the interview report is generated"
        }
    },
    required: ["matchScore", "technicalQuestions", "behaviouralQuestions", "skillGaps", "preparationPlan", "title"]
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate an interview preparation report for the candidate with the following details:
                    Resume: ${resume}
                    Self Description: ${selfDescription}
                    Job Description: ${jobDescription}

You must return: matchScore (0-100), technicalQuestions, behaviouralQuestions, skillGaps, and preparationPlan.`

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: interviewReportSchema
        }
    })

    return JSON.parse(response.text);
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = {
        type: Type.OBJECT,
        properties: {
            html: {
                type: Type.STRING,
                description: "The HTML content of the resume which can be converted to PDF using any library like puppeteer"
            }
        },
        required: ["html"]
    }

    const prompt = `You are an expert resume writer. Generate a tailored, job-specific resume as a single HTML document.

=== CANDIDATE DATA ===
Original Resume: ${resume}
Self Description: ${selfDescription}
Target Job Description: ${jobDescription}

=== OUTPUT REQUIREMENTS ===
Return a JSON object with a single "html" field containing the full resume as self-contained HTML (inline CSS only, no external stylesheets or scripts).

=== PAGE LENGTH (CRITICAL) ===
- Target: 1 page. Absolute maximum: 2 pages.
- The HTML will be rendered to an A4 PDF with 20mm top/bottom and 15mm left/right margins.
- Use compact spacing: line-height 1.3, margins between sections of 6-8px, font-size 10-11px for body text, 13-14px for the candidate name.
- Use single-line bullet points. Avoid lengthy paragraphs — prefer concise, metric-driven statements.

=== STRUCTURE & FORMAT (STRICTLY FOLLOW ORIGINAL) ===
- You MUST replicate the exact same layout, section order, alignment, and visual structure as the candidate's original resume. Do NOT rearrange, merge, split, or rename any sections.
- If the original resume has a two-column layout, keep two columns. If single-column, keep single-column. Match the original exactly.
- Keep the same heading styles, spacing patterns, and bullet formats as the original. Only change the text content, never the structure.
- If the original uses tables for layout, use tables. If it uses divs, use divs. Mirror the original HTML structure as closely as possible.
- Section headings must use the exact same names as the original (e.g. if the original says "Technical Skills", do NOT change it to "Skills" or "Core Competencies").
- If the original resume lacks structure (e.g. plain text with no sections), then use: Contact Info | Summary | Skills | Experience | Projects | Education.
- Bullet points for experience and projects — each bullet should be 1 line, max 2 lines.

=== ROLE-SPECIFIC TAILORING (CRITICAL) ===
- This resume must read as if the candidate wrote it specifically for this exact role. Every section should demonstrate relevance to the target job description.
- Professional Summary: Write a 2-3 line summary that directly addresses the target role. Mention the job title, years of relevant experience, and 3-4 key skills from the JD that the candidate possesses.
- Skills Section: Lead with skills mentioned in the JD that the candidate has. Include related/adjacent skills the candidate likely possesses based on their experience (e.g. if they know React, they likely know JSX, component lifecycle, hooks — add these if the JD asks for them).
- Experience Bullets: Rewrite each bullet to emphasize aspects relevant to the target role. Use action verbs and keywords from the JD. Frame existing experience through the lens of what the target employer cares about.
- Projects: Prioritize projects that demonstrate skills required by the JD. If the candidate has multiple projects, include only the most relevant ones.

=== FILLING SKILL GAPS ===
- Identify skills/technologies in the JD that the candidate's resume is missing but likely possesses based on their background (e.g. a full-stack developer likely knows REST APIs, Git, Agile even if not listed).
- Add these inferable skills naturally to the Skills section — do NOT add skills that are a stretch or fabricated.
- If the candidate's experience can be reworded to highlight a missing JD requirement, do so (e.g. "built a web app" → "designed and deployed a scalable web application using CI/CD pipelines" if they likely used deployment tools).
- For genuinely missing skills, do NOT add them. Only enhance what can be reasonably inferred from their background.

=== CONTENT QUALITY ===
- Write like a human — vary sentence structure, avoid buzzword stuffing, use natural phrasing.
- Quantify achievements wherever possible (numbers, percentages, scale, team size, users served).
- For skills, use a compact comma-separated list grouped by category (Languages, Frameworks, Tools, etc.), not a bulleted list.
- Each experience bullet should follow the pattern: [Action Verb] + [What You Did] + [Impact/Result].

=== ATS COMPLIANCE ===
- Use standard section headings (e.g. "Experience" not "My Journey").
- No images, icons, charts, or decorative elements.
- Use semantic HTML: h1 for name, h2 for sections, ul/li for bullets, p for text.
- Minimal color: black text on white background. A single accent color (#2b6cb0) is allowed only for the name and section borders.

=== STYLING CONSTRAINTS ===
- Font: Arial, Helvetica, sans-serif.
- Body font-size: 10px. Name: 14px bold. Section headings: 12px bold uppercase.
- No padding/margin on the outermost container — the PDF renderer handles page margins.
- Keep the HTML minimal and clean. No unnecessary wrappers or divs.`

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: resumePdfSchema,
            systemInstruction: "You are a resume builder. You generate professional, ATS-friendly resumes that highlight the candidate's strengths and match the job description. Your output must be clean HTML suitable for PDF conversion."
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer
}


module.exports = { generateInterviewReport, generateResumePdf };