
from groq import AsyncGroq


async def generate_job_description(
    client: AsyncGroq,
    model_name: str,
    job_title: str,
    experience_level: str,
    required_skills: list[str],
    responsibilities: list[str],
    employment_type: str | None = None,
    location: str | None = None,
    company_name: str | None = None,
    additional_details: str | None = None,
) -> str:
    """
    Generate a job description draft using HR-provided details.
    The result must be reviewed by HR before publication.
    """

    job_details = {
        "company_name": company_name,
        "job_title": job_title,
        "experience_level": experience_level,
        "required_skills": required_skills,
        "responsibilities": responsibilities,
        "employment_type": employment_type,
        "location": location,
        "additional_details": additional_details,
    }

    prompt = f"""
You are the job description writing assistant for SkillBridge.

Create a professional job description draft using ONLY the
information provided below.

HR-PROVIDED JOB DETAILS:
{job_details}

REQUIREMENTS:
1. Use the provided job title and experience level.
2. Organize the draft with these sections:
   - Job Overview
   - Key Responsibilities
   - Required Skills
   - Additional Details (only if provided)
3. Improve the wording and grammar without changing the meaning.
4. Do not invent a salary, benefits, company information, email,
   work arrangement, qualifications, or other facts.
5. If information is missing, omit it rather than guessing.
6. Do not add skills that HR did not provide.
7. Do not claim that the job is published or approved.
8. Return only the job description draft in Markdown.
"""

    response = await client.chat.completions.create(
        model=model_name,
        messages=[
            {
                "role": "system",
                "content": (
                    "You generate accurate recruitment drafts. "
                    "Never invent facts that were not supplied."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.2,
        max_completion_tokens=1200,
    )

    answer = response.choices[0].message.content

    if not answer or not answer.strip():
        raise ValueError("The AI returned an empty job description.")

    return answer.strip()
