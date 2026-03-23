from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.ai_service import generate_steps
from app.services.execution_service import run_steps

router = APIRouter()


class GenerateRequest(BaseModel):
    text: str
    language: str = "en"


class GenerateResponse(BaseModel):
    steps: list
    code: str


class RunRequest(BaseModel):
    steps: list


class RunResponse(BaseModel):
    success: bool
    stdout: str
    stderr: str
    returncode: int
    code: str = ""


@router.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Test description cannot be empty")

    steps = await generate_steps(request.text)

    # preview კოდი — მხოლოდ საჩვენებლად, არ გაეშვება
    preview = "# Steps that will be executed:\n"
    for i, step in enumerate(steps):
        action = step.get("action")
        if action == "open":
            preview += f"# {i+1}. Open: {step.get('url')}\n"
        elif action == "type":
            preview += f"# {i+1}. Type '{step.get('value')}' into: {step.get('target')}\n"
        elif action == "click":
            preview += f"# {i+1}. Click: {step.get('target')}\n"
        elif action == "wait":
            preview += f"# {i+1}. Wait: {step.get('seconds')} seconds\n"
        elif action == "scroll":
            preview += f"# {i+1}. Scroll: {step.get('direction')}\n"
        elif action == "select":
            preview += f"# {i+1}. Select '{step.get('value')}' in: {step.get('target')}\n"

    return GenerateResponse(steps=steps, code=preview)


@router.post("/run", response_model=RunResponse)
async def run(request: RunRequest):
    if not request.steps:
        raise HTTPException(status_code=400, detail="Steps cannot be empty")

    result = run_steps(request.steps)
    return RunResponse(**result)


@router.post("/generate-and-run", response_model=RunResponse)
async def generate_and_run(request: GenerateRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Test description cannot be empty")

    steps = await generate_steps(request.text)
    result = run_steps(steps)
    return RunResponse(**result)