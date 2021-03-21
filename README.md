# Simple login project using REST

Simple login example, hashing passwords and working with tokens.

## How to run the project

Install dependencies:

```shell 
npm install
```

Create `.env` or rename `.env.example` and update file with your credentials.

Run the project:

```shell
npm start
```

Create `.rest` file to run requests in editor or connect use [http://localhost:3030/](http://localhost:3030/) as endpoint.

## Examples 

### List all users
```rest
GET http://localhost:3030/users?page=2&limit=1
```

### Create user
```rest
POST http://localhost:3030/sign-up
Content-Type: application/json

{
  "name": "user",
  "password": "password"
}
```