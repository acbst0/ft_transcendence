FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Use Daphne for ASGI support (WebSocket)
CMD ["sh", "-c", "python manage.py migrate && daphne -b 0.0.0.0 -p 8000 transcendence.asgi:application"]
