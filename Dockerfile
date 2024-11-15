# Use the official Node.js v16 image as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/server

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose the application's port (ensure your server.js listens on this port)
EXPOSE 8080

# Define the command to run the application
CMD [ "node", "server.js" ]