# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Run stage (Tomcat)
FROM tomcat:9.0-jre17-temurin
WORKDIR /usr/local/tomcat/webapps/
# Cleanup default apps
RUN rm -rf ROOT
# Force UTF-8 encoding in server.xml
RUN sed -i 's/connectionTimeout="20000"/connectionTimeout="20000" URIEncoding="UTF-8"/g' /usr/local/tomcat/conf/server.xml
COPY --from=build /app/target/*.war ROOT.war
# Rename to backend.war or ROOT.war depending on preference, 
# but per docker-compose we'll expose 8207.
EXPOSE 8080
ENV JAVA_OPTS="-Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8"
CMD ["catalina.sh", "run"]
