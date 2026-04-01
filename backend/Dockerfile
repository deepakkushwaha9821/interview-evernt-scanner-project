FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
	libgl1 \
	libglib2.0-0 \
	&& rm -rf /var/lib/apt/lists/*

COPY requirements.render.txt .
RUN pip install --no-cache-dir --upgrade pip && \
	pip install --no-cache-dir -r requirements.render.txt

COPY . .

ENV PORT=10000
EXPOSE 10000

CMD ["sh", "-c", "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
