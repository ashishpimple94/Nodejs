# API Testing Guide

## Get All Endpoints
```curl
curl -X GET http://localhost:5000/
```

## Upload Excel File
```curl
curl -X POST http://localhost:5000/api/voters/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/excel-file.xlsx"  # Field name must be "file"
```

## Get All Voters
```curl
curl -X GET http://localhost:5000/api/voters
```

## Get Voter by ID
```curl
curl -X GET http://localhost:5000/api/voters/voter-id-here
```

## Delete All Voters
```curl
curl -X DELETE http://localhost:5000/api/voters
```

## Expected Response Formats

### Success Response
```json
{
  "success": true,
  "data": [...],
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description here"
}
```

## File Upload Instructions
Important: The field name for file upload must be "file"

```curl
curl -X POST http://localhost:5000/api/voters/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/excel-file.xlsx"  # Field name must be "file"
```

## Postman Upload Steps:
1. Select POST method
2. Enter URL: http://localhost:5000/api/voters/upload
3. Go to "Body" tab
4. Select "form-data"
5. Add key as "file" (Important: key must be exactly "file")
6. Select type as "File" from dropdown
7. Choose your Excel file

## Postman Collection

You can import this collection in Postman:

```json
{
  "info": {
    "name": "Excel Upload API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All Endpoints",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/"
      }
    },
    {
      "name": "Upload Excel",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/voters/upload",
        "header": [],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "/path/to/your/excel-file.xlsx"
            }
          ]
        }
      }
    },
    {
      "name": "Get All Voters",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/voters"
      }
    },
    {
      "name": "Get Voter by ID",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/voters/:id"
      }
    },
    {
      "name": "Delete All Voters",
      "request": {
        "method": "DELETE",
        "url": "http://localhost:5000/api/voters"
      }
    }
  ]
}
```
