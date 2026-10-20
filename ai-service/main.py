
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from groq import AsyncGroq
from pydantic import BaseModel, Field
from pydantic import BaseModel, Field
from features.job_description import generate_job_description

load_dotenv()

app = FastAPI(
    title="SkillBridge AI Service",
    version="1.0.0",
)

api_key = os.getenv("GROQ_API_KEY")
model_name = os.getenv("AI_MODEL", "openai/gpt-oss-20b")

client = AsyncGroq(api_key=api_key) if api_key else None


class AIRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=4000)

class JobDescriptionRequest(BaseModel):
    job_title: str = Field(min_length=2, max_length=150)
    experience_level: str = Field(min_length=1, max_length=100)

    required_skills: list[str] = Field(min_length=1, max_length=30)
    responsibilities: list[str] = Field(min_length=1, max_length=20)

    employment_type: str | None = Field(default=None, max_length=100)
    location: str | None = Field(default=None, max_length=150)
    company_name: str | None = Field(default=None, max_length=200)
    additional_details: str | None = Field(default=None, max_length=2000)

@app.post("/api/ai/job-description")
async def create_job_description(request: JobDescriptionRequest):
    if client is None:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY is not configured",
        )

    try:
        answer = await generate_job_description(
            client=client,
            model_name=model_name,
            job_title=request.job_title,
            experience_level=request.experience_level,
            required_skills=request.required_skills,
            responsibilities=request.responsibilities,
            employment_type=request.employment_type,
            location=request.location,
            company_name=request.company_name,
            additional_details=request.additional_details,
        )

        return {
            "success": True,
            "feature": "job_description_generator",
            "draft": answer,
            "requires_hr_review": True,
        }

    except Exception as error:
        print(
            f"Job description generation failed: "
            f"{type(error).__name__}: {error}"
        )

        raise HTTPException(
            status_code=502,
            detail="Unable to generate the job description. Check service logs.",
        )

@app.get("/")
def home():
    return {
        "message": "SkillBridge AI Service is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "skillbridge-ai",
        "model_configured": client is not None,
    }


@app.post("/api/ai/test")
async def test_ai(request: AIRequest):
    if client is None:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY is not configured",
        )

    try:
        response = await client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are SkillBridge AI, an assistant "
                        "for skills, careers, and recruitment. "
                        "Give clear, useful, concise answers."
                    ),
                },
                {
                    "role": "user",
                    "content": request.prompt,
                },
            ],
            temperature=0.3,
            max_completion_tokens=700,
        )

        answer = response.choices[0].message.content

        return {
            "success": True,
            "model": model_name,
            "answer": answer or "",
        }

    except Exception as error:
        print(f"AI request failed: {type(error).__name__}: {error}")

        raise HTTPException(
            status_code=502,
            detail="The AI provider request failed. Check the service logs.",
        )
