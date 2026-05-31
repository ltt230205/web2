FROM node:18-alpine

WORKDIR /app

# Copy package file
COPY package.json ./

# Install dependencies
RUN npm install

# Copy app code
COPY . .

# Expose port
EXPOSE 5173

# Run dev server with host binding
CMD ["npm", "run", "dev", "--", "--host"]
