FROM perl:5-slim
WORKDIR /app
COPY perl/hocuspocus.pl .
ENTRYPOINT ["perl", "hocuspocus.pl"]
