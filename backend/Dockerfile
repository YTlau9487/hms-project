FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directory for SQLite database
RUN mkdir -p /app/data

# Install dos2unix and fix Windows line endings (build-time)
RUN apt-get update && apt-get install -y dos2unix && \
    dos2unix start.sh seed.py && \
    chmod +x start.sh && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 8000

# Run the application with seed
CMD ["sh", "start.sh"]