{
  "name": "Job",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Job title"
    },
    "description": {
      "type": "string",
      "description": "Job description"
    },
    "category": {
      "type": "string",
      "enum": [
        "hospitality",
        "construction",
        "transport",
        "domestic",
        "sales",
        "technology",
        "healthcare",
        "other"
      ]
    },
    "poster_id": {
      "type": "string",
      "description": "ID of the user who posted the job"
    },
    "salary_range": {
      "type": "string",
      "description": "Salary range or amount"
    },
    "location": {
      "type": "object",
      "properties": {
        "latitude": {
          "type": "number"
        },
        "longitude": {
          "type": "number"
        },
        "address": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "emirate": {
          "type": "string"
        }
      }
    },
    "requirements": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "contact": {
      "type": "object",
      "properties": {
        "phone": {
          "type": "string"
        },
        "email": {
          "type": "string"
        },
        "whatsapp": {
          "type": "string"
        }
      }
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "approved",
        "rejected",
        "closed"
      ],
      "default": "pending"
    },
    "expires_at": {
      "type": "string",
      "format": "date"
    },
    "is_urgent": {
      "type": "boolean",
      "default": false
    },
    "job_type": {
      "type": "string",
      "enum": [
        "full_time",
        "part_time",
        "contract",
        "temporary"
      ]
    }
  },
  "required": [
    "title",
    "description",
    "category",
    "poster_id"
  ],
  "rls": {
    "read": {},
    "write": {
      "$or": [
        {
          "poster_id": "{{user.id}}"
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    }
  }
}