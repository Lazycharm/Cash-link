{
  "name": "Event",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Event title"
    },
    "description": {
      "type": "string",
      "description": "Event description"
    },
    "category": {
      "type": "string",
      "enum": [
        "cultural",
        "business",
        "social",
        "religious",
        "educational",
        "entertainment",
        "sports",
        "other"
      ]
    },
    "organizer_id": {
      "type": "string",
      "description": "ID of the user who organized the event"
    },
    "start_datetime": {
      "type": "string",
      "format": "date-time",
      "description": "The start date and time of the event"
    },
    "end_datetime": {
      "type": "string",
      "format": "date-time",
      "description": "The end date and time of the event"
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
        "venue_name": {
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
    "images": {
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
        "cancelled",
        "completed"
      ],
      "default": "pending"
    },
    "is_free": {
      "type": "boolean",
      "default": true
    },
    "ticket_options": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "price": {
            "type": "number"
          },
          "description": {
            "type": "string"
          }
        }
      },
      "default": []
    },
    "max_attendees": {
      "type": "number"
    },
    "current_attendees": {
      "type": "number",
      "default": 0
    },
    "is_featured": {
      "type": "boolean",
      "default": false
    },
    "promotion_expires": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": [
    "title",
    "description",
    "category",
    "organizer_id",
    "start_datetime",
    "end_datetime"
  ],
  "rls": {
    "read": {},
    "write": {
      "$or": [
        {
          "organizer_id": "{{user.id}}"
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