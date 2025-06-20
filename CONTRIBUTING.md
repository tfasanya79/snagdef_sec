# SnagDef Contribution Guide

## Python Import Standards

### Absolute Imports Required
```python
# Correct
from backend.utils.security import get_current_user
from backend.models.database import User

# Wrong
from utils.security import get_current_user
from ...models.database import User

""" Route File Structure
python """

from fastapi import APIRouter, Depends
from backend.models.database import User
from backend.utils.security import get_current_user

router = APIRouter()  # Must be declared first

@router.get("/example")
async def example_route(user: User = Depends(get_current_user)):
    return {"user": user.username}


""" Required Practices

    Always close database sessions with try/finally

    Use absolute imports starting with backend.

    Initialize APIRouter() immediately after imports

    Explicitly import all models/classes being used

Running the Project
bash """

# From project root
PYTHONPATH=$(pwd) uvicorn backend.main:app --reload --port 8000

""" Testing
bash """

# Test registration
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"test", "password":"test"}'
