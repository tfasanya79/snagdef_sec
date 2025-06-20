FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

EXPOSE 8000

ENV PYTHONPATH=/app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]