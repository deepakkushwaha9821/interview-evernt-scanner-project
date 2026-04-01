FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
COPY requirements.render.txt .
RUN pip install --no-cache-dir -r requirements.txt -r requirements.render.txt

COPY . .

ENV PORT=10000
EXPOSE 10000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
