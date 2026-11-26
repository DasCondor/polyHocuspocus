FROM ruby:3-alpine
WORKDIR /app
COPY ruby/hocuspocus.rb .
ENTRYPOINT ["ruby", "hocuspocus.rb"]
