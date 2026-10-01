# NodeJS Serv exposing Postgres Database to Web Clients

**NOTE** *This is best used on an internal network, not exposed to the public internet*

## Local Setup and Installation

1. In the directory where the server will run:
  - Init the directory
    ```bash
    npm init -y 
    ```
  - Install the libraries
    ```bash
    npm install express pg dotenv cors
    ```
  - Install nodemon
    ```bash
    npm install --save-dev nodemon
    ```
  - Use version 22 of NodeJS
    ```bash
    nvm use 22
    ```
  - Update package.json to add `dev` and `start`
    ```bash
    "scripts": {
      "dev": "nodemon server.js",
      "start": "node server.js"
    },
    ```
  - Install all packages referenced in package.json
    ```bash
    npm install
    ```
  - Launch nodemon, watch for file changes, restart node automatically when Server script changes
    ```bash
    npm run dev
    ```
  - All comamands in one section
  ```bash
  npm init -y 
  npm install express pg dotenv cors
  npm install --save-dev nodemon
  nvm use 22
  awk '
  /"scripts": *{/ {print "  \"scripts\": {\n      \"dev\": \"nodemon server.js\",\n      \"start\": \"node server.js\"\n    },"; inblock=1; next}
  inblock && /},/ {inblock=0; next}
  !inblock {print}
  ' package.json > package.json.tmp && mv package.json.tmp package.json
  npm install
  npm run dev
  ```

### Run this command to test

1. Test from LOCALHOST
  ```bash
  curl -X POST http://localhost:3000/api/query/nmea \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"SELECT e.*, f.full_path FROM nmea_enriched e LEFT JOIN file_reference f ON e.file_ref_id = f.id WHERE e.nmea_date >= '2026-07-01' AND e.state = 'Georgia' AND e.speed_mph >= 50;\"}"
  ```
1. Test from 192.168.0.115
  ```bash
  curl -X POST http://192.168.0.115:3000/api/query/nmea \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"SELECT e.*, f.full_path FROM nmea_enriched e LEFT JOIN file_reference f ON e.file_ref_id = f.id WHERE e.nmea_date >= '2026-07-01' AND e.state = 'Georgia' AND e.speed_mph >= 50;\"}"
  ```

 ## Build the Docker image

 ```
 docker build -t gps-api:1.0 .
```

## Create an instance of the container

Create a file env file: gps-api-env.txt - with:
  ```bash
  POSTGRES_HOST=192.168.0.115
  POSTGRES_PORT=5444
  POSTGRES_USER=???????
  POSTGRES_PASSWORD=??????
  ```

Start the container:
  ```bash
  docker run -d --env-file gps-api-env.txt -p 3000:3000 gps-api:1.0
  ```

Explanation of flags:

1. -d  :  detached mode, run in the background
1. --env-file gps-api-env.txt  :  loads environment variables from here
1. -p 3000:300  :  Map container port 3000 to host port 3000, first port is the host port, second port is the container port
1. gps-api:1.0  :  The image name and version number