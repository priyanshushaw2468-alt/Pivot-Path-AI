import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, RoadmapData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const roadmapSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A motivating executive summary of the career pivot strategy."
    },
    currentAnalysis: {
      type: Type.STRING,
      description: "Brief analysis of current transferable skills."
    },
    gapAnalysis: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of specific skill or experience gaps to bridge."
    },
    estimatedTotalTime: {
      type: Type.STRING,
      description: "Estimated time to be job-ready (e.g., '3-6 months')."
    },
    atsAnalysis: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: "ATS compatibility score from 0-100 based on keyword matching and formatting." },
        matchLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
        missingKeywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Crucial hard skills and keywords for the target role that are missing from the resume."
        },
        formattingIssues: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Potential formatting problems that might confuse an ATS (e.g. columns, graphics, complex headers)."
        },
        tips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Specific, actionable tips to improve the resume for this specific target role."
        }
      },
      required: ["score", "matchLevel", "missingKeywords", "formattingIssues", "tips"]
    },
    timeline: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Milestone title (e.g., 'Foundational Learning')" },
          duration: { type: Type.STRING, description: "Duration (e.g., 'Weeks 1-4')" },
          description: { type: Type.STRING, description: "Goal of this phase." },
          keyActions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3-4 specific actionable bullet points."
          },
          resources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["Course", "Book", "Article", "Tool"] },
                provider: { type: Type.STRING },
                duration: { type: Type.STRING }
              }
            }
          }
        },
        required: ["title", "duration", "description", "keyActions", "resources"]
      }
    }
  },
  required: ["summary", "currentAnalysis", "gapAnalysis", "timeline", "estimatedTotalTime", "atsAnalysis"]
};

export const generateCareerRoadmap = async (profile: UserProfile): Promise<RoadmapData> => {
  const parts: any[] = [];

  // Handle resume (text or binary)
  if (profile.resumeData) {
      parts.push({
          inlineData: {
              mimeType: profile.resumeData.mimeType,
              data: profile.resumeData.data
          }
      });
      parts.push({ text: "Analyze the attached resume file to understand the user's background, experience, and transferable skills." });
  } else if (profile.resumeText) {
      parts.push({ text: `Resume Context: ${profile.resumeText.substring(0, 10000)}` });
  } else {
      parts.push({ text: "No resume provided." });
  }

  const promptText = `
    Act as an expert career coach and ATS (Applicant Tracking System) specialist.
    
    User Profile:
    - Current Role/Background: ${profile.currentRole}
    - Target Role: ${profile.targetRole}
    - Target Industry: ${profile.targetIndustry}
    - Self-identified Skills: ${profile.topSkills.join(', ')}
    - Learning Style: ${profile.learningStyle}

    Task 1: Create a detailed, step-by-step career pivot roadmap.
    - Break it down into logical milestones.
    - Suggest specific real-world resources.

    Task 2: Perform a strict ATS Scan on the provided resume content against the Target Role ("${profile.targetRole}").
    - Calculate a compatibility score (0-100).
    - Identify CRITICAL missing keywords (hard skills, tools, methodologies) that an ATS would look for.
    - Check for formatting red flags.
    - Provide specific tips to pass the screen.
  `;
  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: roadmapSchema,
        systemInstruction: "You are PivotPath AI. You provide brutal but constructive honesty regarding resume ATS compatibility, followed by an encouraging and strategic career pivot roadmap."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as RoadmapData;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};