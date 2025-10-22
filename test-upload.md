# File Upload Testing Instructions

## Using cURL
```bash
curl -X POST http://localhost:5000/api/voters/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@./test-data/sample.xlsx"
```

## Using Postman
1. Open Postman
2. Create new POST request to `http://localhost:5000/api/voters/upload`
3. Go to "Body" tab
4. Select "form-data"
5. Add key "file" (Type: File)
6. Select the Excel file

## Expected Success Response
```json
{
  "success": true,
  "message": "डेटा सफलतापूर्वक अपलोड हुआ (Data uploaded successfully)",
  "count": 1,
  "data": [
    {
      "serialNumber": "1",
      "houseNumber": "A-101",
      "name": "राजेश कुमार",
      "gender": "पुरुष",
      "age": 35,
      "voterIdCard": "ABC123456",
      "mobileNumber": "9876543210"
    }
  ]
}
```

## Sample Excel File Format
Excel फाइल का फॉर्मैट (Excel File Format):

| अनु क्र. | घर क्र. | नाव | लिंग | वय | मतदान कार्ड क्र. | मोबाईल नं. |
|----------|---------|-----|------|-----|------------------|------------|
| 1 | A-101 | राजेश कुमार | पुरुष | 35 | ABC123456 | 9876543210 |

Note: File must be in .xlsx format
