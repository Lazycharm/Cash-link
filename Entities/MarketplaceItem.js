{
  "name": "MarketplaceItem",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Item title"
    },
    "description": {
      "type": "string",
      "description": "Item description"
    },
    "category": {
      "type": "string",
      "enum": [
        "electronics",
        "vehicles",
        "furniture",
        "clothing",
        "books",
        "sports",
        "toys",
        "home",
        "other"
      ]
    },
    "seller_id": {
      "type": "string",
      "description": "ID of the user selling the item"
    },
    "price": {
      "type": "number",
      "description": "Item price in AED"
    },
    "currency": {
      "type": "string",
      "default": "AED"
    },
    "images": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "condition": {
      "type": "string",
      "enum": [
        "new",
        "like_new",
        "good",
        "fair",
        "poor"
      ]
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
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "approved",
        "rejected",
        "sold",
        "removed"
      ],
      "default": "pending"
    },
    "is_promoted": {
      "type": "boolean",
      "default": false
    },
    "promotion_expires": {
      "type": "string",
      "format": "date"
    },
    "views_count": {
      "type": "number",
      "default": 0
    },
    "is_negotiable": {
      "type": "boolean",
      "default": true
    }
  },
  "required": [
    "title",
    "description",
    "category",
    "seller_id",
    "price"
  ]
}