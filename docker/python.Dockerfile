FROM python:3-alpine
WORKDIR /app
COPY python/hocuspocus.py .
ENTRYPOINT ["python", "hocuspocus.py"]
