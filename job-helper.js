// Offline career-assistant workflows for Lite AI OS.
// This file loads after script.js and replaces its minimal offline response helper.
function localAiReply(text) {
  const message = String(text || "").trim();
  const lower = message.toLowerCase();
  const history = Array.isArray(state?.aiHistory) ? state.aiHistory : [];
  const previousAssistant = [...history].reverse().find(item => item.role === "assistant")?.content || "";
  const continuingIntake = /country|target job|resume|cv|job offer|salary range/i.test(previousAssistant);

  const requestsEverything = /\b(all|everything|do it all|yes|do all)\b/i.test(lower);
  if (requestsEverything && (continuingIntake || /job|career|application|offer|resume|cv/i.test(lower))) {
    return `Absolutely—I can help prepare the complete job-application package, step by step. I can draft and review materials, but I cannot search private accounts, submit applications, contact employers, accept offers, or handle money for you.\n\nTo tailor the package without inventing details, paste the following (you can write “N/A” for anything you don’t know):\n\n1. Country/time zone and preferred work location (remote, onsite, or hybrid)\n2. Target job title(s)\n3. Your resume/CV text, or education, work history, projects, and skills\n4. Languages and links to LinkedIn, GitHub, or portfolio (if any)\n5. Availability/notice period and desired salary range + currency (optional)\n6. The full job description or offer email, including application instructions\n7. Any assignment prompt and deadline, if provided\n\nAfter you share the first job description and your background, I can prepare a tailored application email, cover letter, resume edits, follow-up message, interview preparation, and an assignment plan or draft. Please remove private details such as account passwords, ID numbers, and bank information.`;
  }

  if (/cover letter|application email|apply for|job application/i.test(lower)) {
    return `I can draft a tailored application email and cover letter. Please paste the job description and your resume or relevant experience (skills, education, projects, and achievements). Include the employer's application instructions if available. I’ll use only facts you provide and leave placeholders where information is missing. I can prepare the text for you to review and send; I can’t submit it or contact the employer.`;
  }

  if (/resume|\bcv\b|linkedin|portfolio/i.test(lower)) {
    return `I can help improve and tailor your resume. Paste your current resume and the target job description. I’ll suggest a role-matched summary, skills, and achievement-focused bullet points without inventing credentials or results. You can omit your address, phone number, and other sensitive personal details.`;
  }

  if (/follow.?up|feedback request|recruiter/i.test(lower)) {
    return `Here’s a follow-up template you can review and send:\n\nSubject: Following up — [Job Title] application\n\nHello [Name],\n\nI’m following up on my application for the [Job Title] position, submitted on [date]. I remain interested in the opportunity and would be glad to provide any additional information.\n\nThank you for your time.\n[Your Name]\n\nShare the role, employer, and when you applied, and I can tailor it. I can draft the message but can’t send it for you.`;
  }

  if (/salary|negotia|payment|money/i.test(lower)) {
    return `I can help you prepare a salary discussion or a professional payment-related message. Tell me the role, country/currency, stated or desired range, and the context. Don’t share bank details, passwords, or payment credentials. I can draft wording, but I can’t negotiate, accept payments, or move money on your behalf.`;
  }

  if (/assignment|task prompt|test task|assessment/i.test(lower)) {
    return `Paste the assignment prompt, requirements, and deadline, plus any relevant materials or your attempt so far. I can help break it into steps, explain concepts, review your work, and draft an approach. You remain responsible for checking the result and submitting it yourself.`;
  }

  if (/interview/i.test(lower)) {
    return `I can help you prepare interview answers and practice. Share the job title and description, plus the questions you expect (or received). I can draft sample answers based on your real experience and help structure them with the STAR method.`;
  }

  return `I’m in offline career-helper mode. I can help with job applications, tailored emails and cover letters, resumes, interview practice, follow-ups, salary wording, and assignment planning. Tell me which you want—or paste your resume and a job description to start the full application package. I’ll prepare drafts for you to review; I can’t apply, contact employers, or handle money for you.`;
}
