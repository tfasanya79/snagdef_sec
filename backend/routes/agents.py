from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import pandas as pd

from backend.utils.security import get_current_user
from backend.models.database import User
from backend.agents.recon_agent import scan_network
from backend.agents.threat_detection_agent import ThreatDetectionAgent
from backend.agents.incident_response_agent import contain_threat
from backend.agents.forensics_agent import log_attack

router = APIRouter(
    prefix="/agents",
    tags=["agents"],
    responses={404: {"description": "Not found"}}
)

class LogData(BaseModel):
    logs: List[Dict[str, Any]]

class ContainmentRequest(BaseModel):
    target: str

class ForensicsRequest(BaseModel):
    details: Dict[str, Any]

@router.post("/recon")
async def recon_agent(ip_range: str, current_user: User = Depends(get_current_user)):
    """Recon Agent: Initiates a network scan using the recon agent logic."""
    return await scan_network(ip_range)

@router.post("/threat-detect")
async def threat_detection(
    log_data: LogData,
    current_user: User = Depends(get_current_user)
):
    """Threat Detection Agent: Detects anomalies in provided logs."""
    if not log_data.logs:
        raise HTTPException(status_code=400, detail="No log data provided")
    df = pd.DataFrame(log_data.logs)
    agent = ThreatDetectionAgent()
    threats = await agent.analyze_logs(df)
    return {"threats": threats, "count": len(threats)}

@router.post("/incident-response")
async def incident_response(
    request: ContainmentRequest,
    current_user: User = Depends(get_current_user)
):
    """Incident Response Agent: Initiates containment for a given target."""
    return await contain_threat(request.target)

@router.post("/forensics")
async def forensics_agent(
    request: ForensicsRequest,
    current_user: User = Depends(get_current_user)
):
    """Forensics Agent: Logs attack details for post-mortem analysis."""
    return await log_attack(request.details)