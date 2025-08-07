import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-development"
});

export interface CoverLetterRequest {
  country: string;
  company: string;
  internshipType: string;
  duration: string;
  fieldOfStudy: string;
  motivations?: string;
  userProfile: {
    firstName: string;
    lastName: string;
    university: string;
    fieldOfStudy: string;
    languages: string[];
  };
}

export async function generateCoverLetter(request: CoverLetterRequest): Promise<{
  title: string;
  content: string;
}> {
  // Return demo content if no API key is provided
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "dummy-key-for-development") {
    return {
      title: `Candidature pour un stage ${request.internshipType} chez ${request.company}`,
      content: `Madame, Monsieur,

Actuellement étudiant(e) en ${request.fieldOfStudy} à ${request.userProfile.university}, je me permets de vous adresser ma candidature pour un stage ${request.internshipType} de ${request.duration} au sein de votre entreprise ${request.company} en ${request.country}.

Passionné(e) par le domaine de ${request.fieldOfStudy}, je souhaite enrichir ma formation par une expérience professionnelle internationale qui me permettrait de développer mes compétences techniques tout en découvrant la culture d'entreprise ${request.country === 'États-Unis' ? 'américaine' : request.country === 'Allemagne' ? 'allemande' : 'internationale'}.

Mes connaissances en ${request.userProfile.languages.join(', ')} ainsi que ma motivation à travailler dans un environnement multiculturel constituent des atouts pour ce stage. ${request.motivations ? `De plus, ${request.motivations}` : ''}

Je serais ravi(e) de pouvoir contribuer à vos projets et d'apporter ma perspective française à votre équipe. Je reste à votre disposition pour tout entretien que vous jugerez nécessaire.

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${request.userProfile.firstName} ${request.userProfile.lastName}`
    };
  }

  try {
    const prompt = `You are an expert career counselor specializing in international internship applications. Generate a professional cover letter in French for the following internship application:

User Profile:
- Name: ${request.userProfile.firstName} ${request.userProfile.lastName}
- University: ${request.userProfile.university}
- Field of Study: ${request.userProfile.fieldOfStudy}
- Languages: ${request.userProfile.languages.join(', ')}

Internship Details:
- Country: ${request.country}
- Company: ${request.company}
- Internship Type: ${request.internshipType}
- Duration: ${request.duration}
- Field: ${request.fieldOfStudy}
- Additional Motivations: ${request.motivations || 'None provided'}

Please generate:
1. A professional subject line in French
2. A compelling cover letter in French that:
   - Is personalized to the company and role
   - Highlights relevant skills and experiences
   - Shows enthusiasm for international experience
   - Is professional yet engaging
   - Is approximately 200-300 words

Return the response in JSON format with "title" and "content" fields.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert career counselor. Generate professional cover letters in French for international internship applications. Always respond with valid JSON containing 'title' and 'content' fields."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    if (!result.title || !result.content) {
      throw new Error("Invalid response format from OpenAI");
    }

    return {
      title: result.title,
      content: result.content,
    };
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw new Error("Failed to generate cover letter. Please try again.");
  }
}
