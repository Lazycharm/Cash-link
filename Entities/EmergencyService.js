{
  "name": "EmergencyService",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "contact_number": {
      "type": "string"
    },
    "category": {
      "type": "string",
      "enum": [
        "medical",
        "police",
        "fire",
        "community_support"
      ]
    },
    "emirate": {
      "type": "string",
      "enum": [
        "all",
        "Dubai",
        "Abu Dhabi",
        "Sharjah",
        "Ajman",
        "Ras Al Khaimah",
        "Fujairah",
        "Umm Al Quwain"
      ]
    }
  },
  "required": [
    "name",
    "contact_number",
    "category",
    "emirate"
  ],
  "rls": {
    "read": {},
    "write": {
      "user_condition": {
        "role": "admin"
      }
    }
  }
}