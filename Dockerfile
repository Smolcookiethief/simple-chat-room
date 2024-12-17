# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container to the root (where server.js is)
WORKDIR /usr/src/app  # This directory will hold the files copied from the local machine

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code into the container
COPY . .

# Expose the port your app will be running on
EXPOSE 3000

# Start the application (this will run server.js in the same directory)
CMD ["npm", "start"]
