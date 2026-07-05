# Use Python 3.11 (stable)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first (for better caching)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend
COPY backend/ .

# Expose port
EXPOSE 5000

# Run the app
CMD ["python", "app.py"]