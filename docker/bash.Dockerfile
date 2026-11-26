FROM bash:5
WORKDIR /app
COPY bash/hocuspocus.sh .
ENTRYPOINT ["bash", "hocuspocus.sh"]
