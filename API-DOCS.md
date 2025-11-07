# API Documentation

## POST /api/voters/upload

Upload Excel file and process voter data.

### Endpoint
```
POST http://localhost:3000/api/voters/upload
```

### Request

**Content-Type:** `multipart/form-data`

**Body:**
- `file` (required): Excel file (.xlsx, .xls)

### Supported Excel Field Names

The API automatically detects the following field variations:

#### Serial Number
- `SR_NO`, `SR NO`, `Sr_No`, `Serial Number`, `Serial No`, `Sr No`, `अनु क्र.`, `अनु क्र`, `क्रमांक`

#### House Number
- `House_No`, `House_Number`, `House Number`, `House No`, `घर क्र.`, `घर क्र`

#### Name (English)
- `Name_En`, `Name_English`, `NameEn`, `Name`, `Full Name`, `Name (English)`, `Name in English`

#### Name (Marathi)
- `Name_Mr`, `Name_Marathi`, `NameMr`, `नाव`, `नाम`, `Name (Marathi)`, `मराठी नाव`

#### Gender (English)
- `Gender_En`, `Gender_English`, `GenderEn`, `Gender`, `Sex`, `Gender (English)`

#### Gender (Marathi)
- `Gender_Mr`, `Gender_Marathi`, `GenderMr`, `लिंग`, `Gender (Marathi)`

#### Age
- `Age`, `वय`

#### EPIC/Voter ID
- `Epic_id`, `Epic_ID`, `EpicId`, `EPIC_ID`, `EPIC No`, `EPIC Number`, `Voter ID`, `Voter ID No`, `मतदान कार्ड क्र.`

#### Mobile Number
- `Mobile_No`, `Mobile_Number`, `MobileNo`, `Mobile Number`, `Mobile No`, `Phone`, `मोबाईल नं.`

### Response

#### Success Response (201)
```json
{
  "success": true,
  "message": "Data uploaded successfully (100 records)",
  "message_mr": "डेटा सफलतापूर्वक अपलोड हो गया (100 रिकॉर्ड्स)",
  "count": 100,
  "sample": [
    {
      "_id": "68fb1d13f33651b2a0c1fb8b",
      "serialNumber": "1",
      "houseNumber": "131",
      "name": "Jadhav Amol Aanant",
      "name_mr": "जाधव आमोल अनंत",
      "gender": "Male",
      "gender_mr": "पुरुष",
      "age": 36,
      "voterIdCard": "DFF0035972",
      "mobileNumber": "7517425200",
      "createdAt": "2025-10-24T06:30:43.774Z",
      "updatedAt": "2025-10-30T11:40:21.885Z"
    }
  ],
  "fieldsInfo": {
    "detectedHeaderRow": 0,
    "totalColumns": 10,
    "columnNames": [
      "SR_NO",
      "House_No",
      "Name_Mr",
      "Gender_Mr",
      "Age",
      "Epic_id",
      "Mobile_No",
      "Name_En",
      "Gender_En",
      "Nana_walke _office_location"
    ],
    "headerRow": [
      "SR_NO",
      "House_No",
      "Name_Mr",
      "Gender_Mr",
      "Age",
      "Epic_id",
      "Mobile_No",
      "Name_En",
      "Gender_En",
      "Nana_walke _office_location"
    ],
    "sampleRow": {
      "SR_NO": "1",
      "House_No": "131",
      "Name_Mr": "जाधव आमोल अनंत",
      "Gender_Mr": "पुरुष",
      "Age": 36,
      "Epic_id": "DFF0035972",
      "Mobile_No": "7517425200",
      "Name_En": "Jadhav Amol Aanant",
      "Gender_En": "Male"
    },
    "allRows": [...]
  }
}
```

#### Error Response (400)
```json
{
  "success": false,
  "message": "Please upload an Excel file. Use field name \"file\"",
  "message_mr": "कृपया Excel फाइल अपलोड करें। फील्ड नाम \"file\" का उपयोग करें"
}
```

### Example using cURL

```bash
curl -X POST http://localhost:3000/api/voters/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/file.xlsx"
```

### Example using JavaScript (Fetch)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:3000/api/voters/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Upload successful:', data);
  console.log('Fields detected:', data.fieldsInfo.columnNames);
})
.catch(error => {
  console.error('Upload failed:', error);
});
```

### Example using Postman

1. Method: **POST**
2. URL: `http://localhost:3000/api/voters/upload`
3. Body tab → form-data
4. Key: `file` (Type: File)
5. Value: Select your Excel file
6. Click Send

### Notes

- The API automatically detects the header row
- Both English and Marathi names are supported
- Names are automatically transliterated if only Marathi is provided
- Gender is automatically translated if only Marathi is provided
- The `fieldsInfo` object in the response shows all detected columns
- File is automatically deleted after processing

---

## GET /api/voters

Get all voters with pagination.

### Endpoint
```
GET http://localhost:3000/api/voters?page=1&limit=50
```

### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 50000)

### Response
```json
{
  "success": true,
  "count": 50,
  "totalCount": 1000,
  "currentPage": 1,
  "totalPages": 20,
  "data": [...]
}
```

---

## GET /api/voters/search

Search voters by name (supports both English and Marathi).

### Endpoint
```
GET http://localhost:3000/api/voters/search?query=Jadhav&page=1&limit=50
```

### Query Parameters
- `query` (required): Search term (can be in English or Marathi)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 50)

### Response
```json
{
  "success": true,
  "message": "Found 10 records",
  "searchTerm": "Jadhav",
  "searchLanguage": "English",
  "count": 10,
  "totalCount": 10,
  "currentPage": 1,
  "totalPages": 1,
  "data": [
    {
      "_id": "...",
      "name": "Jadhav Amol Aanant",
      "name_mr": "जाधव आमोल अनंत",
      "gender": "Male",
      "gender_mr": "पुरुष",
      ...
    }
  ]
}
```

---

## GET /api/voters/:id

Get a single voter by ID.

### Endpoint
```
GET http://localhost:3000/api/voters/68fb1d13f33651b2a0c1fb8b
```

### Response
```json
{
  "success": true,
  "data": {
    "_id": "68fb1d13f33651b2a0c1fb8b",
    "name": "Jadhav Amol Aanant",
    "name_mr": "जाधव आमोल अनंत",
    ...
  }
}
```

---

## DELETE /api/voters

Delete all voters.

### Endpoint
```
DELETE http://localhost:3000/api/voters
```

### Response
```json
{
  "success": true,
  "message": "All data deleted successfully",
  "message_mr": "सभी डेटा सफलतापूर्वक डिलीट हो गया",
  "deletedCount": 1000
}
```

