{
  "name": "Business",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Business name"
    },
    "description": {
      "type": "string",
      "description": "Business description"
    },
    "category": {
      "type": "string",
      "enum": [
        "restaurant",
        "transport",
        "grocery",
        "services",
        "entertainment",
        "retail",
        "other"
      ]
    },
    "owner_id": {
      "type": "string",
      "description": "ID of the vendor who owns this business"
    },
    "images": {
      "type": "array",
      "items": {
        "type": "string"
      }
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
    "hours": {
      "type": "object",
      "properties": {
        "monday": {
          "type": "string"
        },
        "tuesday": {
          "type": "string"
        },
        "wednesday": {
          "type": "string"
        },
        "thursday": {
          "type": "string"
        },
        "friday": {
          "type": "string"
        },
        "saturday": {
          "type": "string"
        },
        "sunday": {
          "type": "string"
        }
      }
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "approved",
        "rejected"
      ],
      "default": "pending"
    },
    "is_featured": {
      "type": "boolean",
      "default": false
    },
    "promotion_expires": {
      "type": "string",
      "format": "date-time"
    },
    "rating": {
      "type": "number",
      "minimum": 0,
      "maximum": 5,
      "default": 0
    },
    "reviews_count": {
      "type": "number",
      "default": 0
    },
    "views_count": {
      "type": "number",
      "default": 0
    }
  },
  "required": [
    "name",
    "description",
    "category",
    "owner_id"
  ],
  "rls": {
    "read": {},
    "write": {
      "$or": [
        {
          "owner_id": "{{user.id}}"
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