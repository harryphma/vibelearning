# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container
COPY requirements.txt ./

COPY . . 

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port the backend runs on
EXPOSE 8000

# Run the backend application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]