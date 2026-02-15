{
  "name": "ActivityLog",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string"
    },
    "action": {
      "type": "string",
      "description": "What action was performed"
    },
    "entity_type": {
      "type": "string",
      "description": "Type of entity affected (user, business, etc.)"
    },
    "entity_id": {
      "type": "string",
      "description": "ID of the affected entity"
    },
    "details": {
      "type": "string",
      "description": "Additional details about the action"
    },
    "ip_address": {
      "type": "string"
    },
    "user_agent": {
      "type": "string"
    }
  },
  "required": [
    "user_id",
    "action"
  ],
  "rls": {
    "read": {
      "user_condition": {
        "role": "admin"
      }
    },
    "write": {
      "user_condition": {
        "role": "admin"
      }
    }
  }
}