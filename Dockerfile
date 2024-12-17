# Step 1: Use the official Node.js image as the base
FROM node:18

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the entire application code into the container
COPY . .

# Step 6: Expose the port the app listens on
EXPOSE 3000

# Step 7: Command to run the app
CMD ["node", "index.js"]
