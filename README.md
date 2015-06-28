# gramster_server
Simple image sharing service, server module

# How to use
Get a user: `GET /user/[id]`

Add a user: `POST /user/` with data conforming to schema
## Schema
```
{
  "_id" : "0",
  "name" : "user",
  "password" : "******",
  "description": "description"
}
```
