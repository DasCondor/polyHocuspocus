# The Python web version: pages rendered on the server, standard library only.
FROM python:3-alpine
WORKDIR /app
COPY web/shared/hocuspocus.css web/shared/
COPY web/python/server.py web/python/
ENV PORT=8000 PYTHONUNBUFFERED=1
EXPOSE 8000
USER nobody
CMD ["python", "web/python/server.py"]
